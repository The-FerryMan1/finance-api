import { describe, it, expect, vi, beforeEach, mock } from 'bun:test';
// Assuming the service functions are imported from the file you provided earlier
// You will need to adjust this path based on where you save your service file.
import {
    createBalance,
    readBalance,
    readBalanceById,
    updateBalance,
    deleteBalance
} from '../balance/service'; 

// --- Interfaces for Robust Mocks ---

// Define the interface for the mocked Drizzle DB object
// We use 'any' here for properties to avoid generic type errors and conflicts
// with Bun's internal re-mapping of vi.fn() to jest.Mock.
interface MockDrizzleDb {
    insert: any;
    values: any;
    returning: any;
    select: any;
    from: any;
    where: any;
    limit: any;
    $count: any;
    update: any;
    set: any;
    delete: any;
}


// --- Mocks Setup ---

// Mock the status function from Elysia, which throws an HTTP error
const mockStatus = vi.fn((code: number, message: string) => {
    // We simulate the throwing behavior of the status function
    const error = new Error(message);
    (error as any).status = code;
    throw error;
}); 

// Mock the database dependency (Drizzle ORM)
// We assign the type here to satisfy the compiler
const mockDb: MockDrizzleDb = {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    $count: vi.fn(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
};

// Mock the schema objects (needed for dependency injection and function imports)
const balance = {}; // Placeholder for the actual schema object

// Mock the imported database and schema
vi.mock('../../database', () => ({ db: mockDb }));
vi.mock('../../database/schema', () => ({ balance }));
vi.mock('elysia', () => ({ status: mockStatus }));
// Mock Drizzle ORM utility functions like 'and' and 'eq'
vi.mock('drizzle-orm', () => ({
    and: vi.fn((...args) => args), // Simple mock to return the arguments
    eq: vi.fn((...args) => args), // Simple mock to return the arguments
}));

// --- Mock Data ---
const MOCK_USER_ID = 'user-test-123';
const MOCK_BALANCE_ID = 456;
const MOCK_NEW_BALANCE_BODY = { balance_type: 'Savings', current_balance: 1000 };
const MOCK_UPDATE_BALANCE_BODY = { balance_type: 'Checking', current_balance: 5000 };
const MOCK_CREATED_RECORD = {
    id: 1,
    user_id: MOCK_USER_ID,
    current_balance: 1000,
    balance_type: 'Savings',
    created_at: new Date('2025-01-01'),
};
const MOCK_READ_RECORD = {
    id: MOCK_BALANCE_ID,
    current_balance: 200,
    balance_type: 'Cash',
    created_at: new Date('2025-01-02'),
};


// Reset mocks before each test to ensure test isolation
beforeEach(() => {
    vi.clearAllMocks();
});

describe('Balance Service', () => {

    // --- createBalance Tests ---
    describe('createBalance', () => {
        it('should successfully create and return a new balance record', async () => {
            // Arrange: Mock the Drizzle `returning` chain to resolve with the created record
            mockDb.returning.mockResolvedValueOnce([MOCK_CREATED_RECORD]);

            // Act
            const result = await createBalance(MOCK_NEW_BALANCE_BODY, MOCK_USER_ID);

            // Assert
            expect(mockDb.insert).toHaveBeenCalledTimes(1);
            expect(mockDb.values).toHaveBeenCalledWith({
                userID: MOCK_USER_ID,
                balanceType: MOCK_NEW_BALANCE_BODY.balance_type,
                currentBalance: MOCK_NEW_BALANCE_BODY.current_balance,
            });
            expect(result).toEqual(MOCK_CREATED_RECORD);
        });

        it('should throw an error if the new record cannot be retrieved', async () => {
            // Arrange: Simulate a failure to retrieve the returning data
            mockDb.returning.mockResolvedValueOnce([]);

            // Act & Assert
            await expect(createBalance(MOCK_NEW_BALANCE_BODY, MOCK_USER_ID))
                .rejects.toThrow('failed to retrieve the newly balance record');
        });
    });

    // --- readBalance Tests ---
    describe('readBalance', () => {
        it('should return all balances for a given user ID', async () => {
            // Arrange: Mock the query result
            const mockRows = [MOCK_READ_RECORD, { ...MOCK_READ_RECORD, id: 457 }];
            mockDb.select.mockReturnThis();
            mockDb.from.mockReturnThis();
            mockDb.where.mockResolvedValueOnce(mockRows);

            // Act
            const result = await readBalance(MOCK_USER_ID);

            // Assert
            expect(mockDb.where).toHaveBeenCalledTimes(1);
            // We can't check 'eq' directly as it's a Drizzle function, but we verify the call chain
            expect(result).toEqual(mockRows);
        });

        it('should throw a 400 error if no user ID is provided', async () => {
            // Act & Assert
            await expect(readBalance(''))
                .rejects.toThrow('No user id provided');
            expect(mockStatus).toHaveBeenCalledWith(400, "No user id provided");
        });
    });

    // --- readBalanceById Tests ---
    describe('readBalanceById', () => {
        const getParam = { id: MOCK_BALANCE_ID };

        it('should return a specific balance record by ID and user ID', async () => {
            // Arrange: $count must return 1 (found), select must return the record
            mockDb.$count.mockResolvedValueOnce(1);
            mockDb.where.mockResolvedValueOnce([MOCK_READ_RECORD]);

            // Act
            const result = await readBalanceById(getParam, MOCK_USER_ID);

            // Assert
            expect(mockDb.$count).toHaveBeenCalledTimes(1);
            expect(result).toEqual(MOCK_READ_RECORD);
        });

        it('should throw a 404 error if the balance ID does not exist', async () => {
            // Arrange: $count must return 0 (not found)
            mockDb.$count.mockResolvedValueOnce(0);

            // Act & Assert
            await expect(readBalanceById(getParam, MOCK_USER_ID))
                .rejects.toThrow('Not Found');
            expect(mockStatus).toHaveBeenCalledWith(404, 'Not Found');
        });
    });

    // --- updateBalance Tests ---
    describe('updateBalance', () => {
        const getParam = { id: MOCK_BALANCE_ID };

        it('should successfully update and return the updated balance record', async () => {
            // Arrange: $count must return 1, update must return the updated record
            mockDb.$count.mockResolvedValueOnce(1);
            const mockUpdatedRow = { ...MOCK_READ_RECORD, current_balance: MOCK_UPDATE_BALANCE_BODY.current_balance };
            mockDb.returning.mockResolvedValueOnce([mockUpdatedRow]);

            // Act
            const result = await updateBalance(getParam, MOCK_UPDATE_BALANCE_BODY, MOCK_USER_ID);

            // Assert
            expect(mockDb.update).toHaveBeenCalledTimes(1);
            expect(mockDb.set).toHaveBeenCalledWith({
                currentBalance: MOCK_UPDATE_BALANCE_BODY.current_balance,
                balanceType: MOCK_UPDATE_BALANCE_BODY.balance_type,
            });
            expect(result).toEqual(mockUpdatedRow);
        });

        it('should throw a 404 error if the balance ID to update does not exist', async () => {
            // Arrange: $count must return 0
            mockDb.$count.mockResolvedValueOnce(0);

            // Act & Assert
            await expect(updateBalance(getParam, MOCK_UPDATE_BALANCE_BODY, MOCK_USER_ID))
                .rejects.toThrow('Not Found');
            expect(mockStatus).toHaveBeenCalledWith(404, 'Not Found');
        });
    });

    // --- deleteBalance Tests ---
    describe('deleteBalance', () => {
        const deleteParam = { id: MOCK_BALANCE_ID };

        it('should successfully delete a balance record', async () => {
            // Arrange: $count must return 1 (found), delete is called
            mockDb.$count.mockResolvedValueOnce(1);
            mockDb.delete.mockReturnThis();
            mockDb.where.mockResolvedValueOnce(undefined);

            // Act
            const result = await deleteBalance(deleteParam, MOCK_USER_ID);

            // Assert
            expect(mockDb.delete).toHaveBeenCalledTimes(1);
            expect(result).toBe("Balance Deleted successfully");
        });

        it('should throw a 404 error if the balance ID to delete is not found', async () => {
            // Arrange: $count must return 0 (not found)
            mockDb.$count.mockResolvedValueOnce(0);

            // Act & Assert
            await expect(deleteBalance(deleteParam, MOCK_USER_ID))
                .rejects.toThrow('Not Found'); // The catch block converts 'Balance not found' to 404 'Not Found'
            expect(mockStatus).toHaveBeenCalledWith(404, 'Not Found');
        });

        it('should throw a 500 error for an unexpected database error', async () => {
            // Arrange: $count returns 1, but the subsequent delete fails unexpectedly
            mockDb.$count.mockResolvedValueOnce(1);
            mockDb.delete.mockImplementationOnce(() => {
                throw new Error("DB Connection Failed");
            });

            // Act & Assert
            await expect(deleteBalance(deleteParam, MOCK_USER_ID))
                .rejects.toThrow('Internal Server Error');
            expect(mockStatus).toHaveBeenCalledWith(500, 'Internal Server Error');
        });
    });
});