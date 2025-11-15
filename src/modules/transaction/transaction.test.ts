import { describe, it, expect, vi, beforeEach } from 'bun:test';
import { and, eq, sql, exists } from "drizzle-orm"; // Need to import these for mock validation
import {
    createTransaction,
    readTrasaction,
    readTrasanctionHistory,
    softDeleteTransanction,
    HardDeleteTransanction,
    revertTransaction
} from '../transaction/service';

// --- Interfaces for Robust Mocks ---

// Interface mirroring the Drizzle ORM functions used in the service.
interface MockDrizzleDb {
    insert: any;
    values: any;
    returning: any;
    select: any;
    from: any;
    where: any;
    $count: any;
    update: any;
    set: any;
    delete: any;
    transaction: any; // Add transaction mock
}


// --- Mocks Setup ---

// Mock the status function from Elysia to simulate HTTP error throwing
const mockStatus = vi.fn((code: number, message: string) => {
    const error = new Error(message);
    (error as any).status = code;
    throw error;
});

// Mock Drizzle schema and utility functions
const transaction = {};
const balance = {};
const category = {};
const TransactionType = { EXPENSE: 'expense', INCOME: 'income', REVERT: 'revert' };

vi.mock('../../database/schema', () => ({ transaction, balance, category, TransactionType }));
vi.mock('elysia', () => ({ status: mockStatus }));
vi.mock('drizzle-orm', () => ({
    and: vi.fn((...args) => args),
    eq: vi.fn((...args) => args),
    sql: vi.fn((...args) => args), // Mock sql template literal function
    exists: vi.fn((...args) => args), // Mock exists
}));

// Mock the transaction execution context (tx)
const mockTx = {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
};

// Mock the main database dependency
const mockDb: MockDrizzleDb = {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    $count: vi.fn(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    // Mock the transaction wrapper to execute the callback with the mockTx object
    transaction: vi.fn(async (callback) => {
        return callback(mockTx);
    }),
};

vi.mock('../../database', () => ({ db: mockDb }));


// --- Mock Data ---
const MOCK_USER_ID = 'user-test-123';
const MOCK_TRANSACTION_ID = 500;
const MOCK_CATEGORY_ID = 101;
const MOCK_BALANCE_ID = 202;
const MOCK_AMOUNT = 50.0;
const MOCK_INSUFFICIENT_AMOUNT = 50000.0;
const MOCK_CURRENT_BALANCE = 1000.0;

const MOCK_TRANSACTION_BODY = {
    amount: MOCK_AMOUNT,
    balance_id: MOCK_BALANCE_ID,
    description: 'Coffee purchase',
};
const MOCK_TRANSACTION_PARAMS = { id: MOCK_TRANSACTION_ID };
const MOCK_CATEGORY_PARAMS = { id: MOCK_CATEGORY_ID };

const MOCK_CREATED_RECORD = {
    id: MOCK_TRANSACTION_ID,
    category_id: MOCK_CATEGORY_ID,
    balance_id: MOCK_BALANCE_ID,
    amount: MOCK_AMOUNT,
    description: MOCK_TRANSACTION_BODY.description,
    date: new Date('2025-01-01'),
    revertedID: null,
    type: 'expense'
};

const MOCK_TRANSACTION_ROW = {
    trasanctionDetails: MOCK_CREATED_RECORD,
    alreadyReverted: false,
};

// --- Helper to Reset tx Mocks ---
const resetTxMocks = () => {
    vi.clearAllMocks();
    mockTx.insert.mockClear().mockReturnThis();
    mockTx.values.mockClear().mockReturnThis();
    mockTx.returning.mockClear();
    mockTx.select.mockClear().mockReturnThis();
    mockTx.from.mockClear().mockReturnThis();
    mockTx.where.mockClear().mockResolvedValue([]);
    mockTx.update.mockClear().mockReturnThis();
    mockTx.set.mockClear().mockReturnThis();
};

beforeEach(() => {
    resetTxMocks();
});

/**
 * Utility function to create a mock Drizzle select chain implementation
 * that resolves directly to the provided array. This is used for complex
 * queries to avoid chaining issues in the mock runner.
 */
function mockSelectChainResolution(resolvedValue: any[]) {
    return vi.fn().mockImplementationOnce(() => ({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValueOnce(resolvedValue),
    } as any));
}

describe('Transaction Service', () => {

    // --- createTransaction Tests ---
    describe('createTransaction', () => {
        it('should successfully create transaction and deduct from balance', async () => {
            // Arrange
            mockTx.returning.mockResolvedValueOnce([MOCK_CREATED_RECORD]); // 1. Insert transaction
            mockTx.where.mockResolvedValueOnce([{ balance: MOCK_CURRENT_BALANCE }]); // 2. Select current balance
            mockTx.set.mockReturnThis(); // 3. Update balance

            // Act
            const result = await createTransaction(MOCK_CATEGORY_PARAMS, MOCK_TRANSACTION_BODY, MOCK_USER_ID);

            // Assert
            expect(mockDb.transaction).toHaveBeenCalledTimes(1);
            expect(mockTx.insert).toHaveBeenCalledTimes(1);
            expect(mockTx.select).toHaveBeenCalledTimes(1);
            expect(mockTx.update).toHaveBeenCalledTimes(1);
            expect(result).toEqual(MOCK_CREATED_RECORD);
        });

        it('should throw 400 if transaction creation fails', async () => {
            // Arrange
            mockTx.returning.mockResolvedValueOnce([]); // 1. Insert fails
            // Act & Assert
            await expect(createTransaction(MOCK_CATEGORY_PARAMS, MOCK_TRANSACTION_BODY, MOCK_USER_ID))
                .rejects.toThrow('Unable to create new transaction');
            expect(mockStatus).toHaveBeenCalledWith(400, "Unable to create new transaction");
        });

        it('should throw 404 if balance is not found', async () => {
            // Arrange
            mockTx.returning.mockResolvedValueOnce([MOCK_CREATED_RECORD]); // 1. Insert transaction
            mockTx.where.mockResolvedValueOnce([]); // 2. Select current balance fails (returns empty array)

            // Act & Assert
            await expect(createTransaction(MOCK_CATEGORY_PARAMS, MOCK_TRANSACTION_BODY, MOCK_USER_ID))
                .rejects.toThrow('Unable to create new transaction, balance not found');
            expect(mockStatus).toHaveBeenCalledWith(404, "Unable to create new transaction, balance not found");
        });

        it('should throw 403 for insufficient balance', async () => {
            // Arrange
            mockTx.returning.mockResolvedValueOnce([MOCK_CREATED_RECORD]); // 1. Insert transaction
            mockTx.where.mockResolvedValueOnce([{ balance: MOCK_CURRENT_BALANCE }]); // 2. Select current balance (1000)

            const bodyWithHighAmount = { ...MOCK_TRANSACTION_BODY, amount: MOCK_INSUFFICIENT_AMOUNT };

            // Act & Assert
            await expect(createTransaction(MOCK_CATEGORY_PARAMS, bodyWithHighAmount, MOCK_USER_ID))
                .rejects.toThrow('insufficient balance');
            expect(mockStatus).toHaveBeenCalledWith(403, "insufficient balance");
            expect(mockTx.update).not.toHaveBeenCalled(); // Ensure update is NOT called
        });
    });

    // --- readTrasaction (By Category ID) Tests ---
    describe('readTrasaction', () => {
        it('should return transactions for a valid category ID', async () => {
            // Arrange
            const mockRows = [MOCK_CREATED_RECORD, { ...MOCK_CREATED_RECORD, id: 501 }];
            mockDb.$count.mockResolvedValueOnce(1); // Category check passes
            mockDb.where.mockResolvedValueOnce(mockRows); // Select transactions

            // Act
            const result = await readTrasaction(MOCK_CATEGORY_PARAMS, MOCK_USER_ID);

            // Assert
            expect(mockDb.$count).toHaveBeenCalledTimes(1);
            expect(mockDb.where).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockRows);
        });

        it('should throw 404 if category does not exist', async () => {
            // Arrange
            mockDb.$count.mockResolvedValueOnce(0); // Category check fails

            // Act & Assert
            await expect(readTrasaction(MOCK_CATEGORY_PARAMS, MOCK_USER_ID))
                .rejects.toThrow('Category does not exists');
            expect(mockStatus).toHaveBeenCalledWith(404, "Category does not exists");
            expect(mockDb.select).not.toHaveBeenCalled();
        });
    });

    // --- readTrasanctionHistory (All History) Tests ---
    describe('readTrasanctionHistory', () => {
        it('should return all transactions for the user', async () => {
            // Arrange
            const mockRows = [MOCK_CREATED_RECORD, { ...MOCK_CREATED_RECORD, id: 502 }];
            mockDb.where.mockResolvedValueOnce(mockRows); // Select transactions

            // Act
            const result = await readTrasanctionHistory(MOCK_USER_ID);

            // Assert
            expect(mockDb.where).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockRows);
        });
    });

    // --- softDeleteTransanction Tests ---
    describe('softDeleteTransanction', () => {
        it('should successfully soft delete a transaction (set trash=true)', async () => {
            // Arrange
            mockDb.$count.mockResolvedValueOnce(1); // Transaction found
            mockDb.update.mockReturnThis();

            // Act
            const result = await softDeleteTransanction(MOCK_TRANSACTION_PARAMS, MOCK_USER_ID);

            // Assert
            expect(mockDb.update).toHaveBeenCalledTimes(1);
            expect(mockDb.set).toHaveBeenCalledWith({ trash: true });
            expect(result).toBeUndefined();
        });

        it('should throw 404 if transaction to soft delete is not found', async () => {
            // Arrange
            mockDb.$count.mockResolvedValueOnce(0); // Transaction not found

            // Act & Assert
            await expect(softDeleteTransanction(MOCK_TRANSACTION_PARAMS, MOCK_USER_ID))
                .rejects.toThrow('Not Found');
            expect(mockStatus).toHaveBeenCalledWith(404, "Not Found");
        });
    });

    // --- HardDeleteTransanction Tests ---
    describe('HardDeleteTransanction', () => {
        it('should successfully hard delete a transaction (DELETE FROM table)', async () => {
            // Arrange
            mockDb.$count.mockResolvedValueOnce(1); // Transaction found
            mockDb.delete.mockReturnThis();
            mockDb.where.mockReturnThis();

            // Act
            const result = await HardDeleteTransanction(MOCK_TRANSACTION_PARAMS, MOCK_USER_ID);

            // Assert
            expect(mockDb.delete).toHaveBeenCalledTimes(1);
            expect(mockDb.where).toHaveBeenCalledTimes(1);
            expect(result).toBeUndefined();
        });

        it('should throw 404 if transaction to hard delete is not found', async () => {
            // Arrange
            mockDb.$count.mockResolvedValueOnce(0); // Transaction not found

            // Act & Assert
            await expect(HardDeleteTransanction(MOCK_TRANSACTION_PARAMS, MOCK_USER_ID))
                .rejects.toThrow('Not Found');
            expect(mockStatus).toHaveBeenCalledWith(404, "Not Found");
        });
    });

    // --- revertTransaction Tests ---
    describe('revertTransaction', () => {
        it('should successfully create a revert transaction and refund the balance', async () => {
            // Arrange
            // FIX: Use mockImplementationOnce on select to safely resolve the complex outer query chain
            const transactionRow = { ...MOCK_TRANSACTION_ROW, trasanctionDetails: { ...MOCK_CREATED_RECORD, type: 'expense' } };
            const mockSelect = mockSelectChainResolution([transactionRow]);
            mockDb.select = mockSelect;

            // 2. Mock the internal transaction (insert and update)
            mockTx.insert.mockReturnThis();
            mockTx.set.mockReturnThis(); // Update balance (refund)

            // Act
            const result = await revertTransaction(MOCK_TRANSACTION_PARAMS, MOCK_USER_ID);

            // Assert
            expect(mockDb.select).toHaveBeenCalledTimes(1);
            expect(mockDb.transaction).toHaveBeenCalledTimes(1);
            expect(mockTx.insert).toHaveBeenCalledTimes(1);
            expect(mockTx.set).toHaveBeenCalledTimes(1);
            expect(result).toBeUndefined();
        });

        it('should throw 404 if original transaction is not found', async () => {
            // Arrange
            // FIX: Mock the select chain to resolve to an empty array
            const mockSelect = mockSelectChainResolution([]);
            mockDb.select = mockSelect;

            // Act & Assert
            await expect(revertTransaction(MOCK_TRANSACTION_PARAMS, MOCK_USER_ID))
                .rejects.toThrow('Not Found');
            expect(mockStatus).toHaveBeenCalledWith(404, 'Not Found');
            expect(mockDb.select).toHaveBeenCalledTimes(1);
        });

        it('should throw 400 if transaction has already been reverted', async () => {
            // Arrange
            // FIX: Mock the select chain with alreadyReverted: true
            const alreadyRevertedRow = { ...MOCK_TRANSACTION_ROW, alreadyReverted: true };
            const mockSelect = mockSelectChainResolution([alreadyRevertedRow]);
            mockDb.select = mockSelect;

            // Act & Assert
            await expect(revertTransaction(MOCK_TRANSACTION_PARAMS, MOCK_USER_ID))
                .rejects.toThrow('The original transaction has been reverted already');
            expect(mockStatus).toHaveBeenCalledWith(400, 'The original transaction has been reverted already');
            expect(mockDb.transaction).not.toHaveBeenCalled();
            expect(mockDb.select).toHaveBeenCalledTimes(1);
        });

        it('should throw 400 if the transaction type is already REVERT', async () => {
            // Arrange
            // FIX: Mock the select chain with type: REVERT
            const revertTypeRow = { ...MOCK_TRANSACTION_ROW, trasanctionDetails: { ...MOCK_CREATED_RECORD, type: TransactionType.REVERT } };
            const mockSelect = mockSelectChainResolution([revertTypeRow]);
            mockDb.select = mockSelect;
            
            // Act & Assert
            await expect(revertTransaction(MOCK_TRANSACTION_PARAMS, MOCK_USER_ID))
                .rejects.toThrow("Cannot revert a transaction that is already a revert type");
            expect(mockStatus).toHaveBeenCalledWith(400, "Cannot revert a transaction that is already a revert type");
            expect(mockDb.transaction).not.toHaveBeenCalled();
            expect(mockDb.select).toHaveBeenCalledTimes(1);
        });
    });
});