import { describe, it, expect, vi, beforeEach } from 'bun:test';
// Adjust the path below to point to your category service file
import {
    createCategory,
    readCategory,
    readCategoryByID,
    updateCategory,
    deleteCategory
} from '../category/service'; 

// --- Interfaces for Robust Mocks ---

// Interface mirroring the Drizzle ORM functions used in the service.
// Using 'any' for properties is the robust workaround for Bun/TS type conflicts with vi.fn().
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

// Mock the status function from Elysia to simulate HTTP error throwing
const mockStatus = vi.fn((code: number, message: string) => {
    const error = new Error(message);
    (error as any).status = code;
    throw error;
}); 

// Mock the database dependency (Drizzle ORM)
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

// Mock schema objects
const category = {}; 
const balance = {}; 

// Mock the imported database, schema, and utility functions
vi.mock('../../database', () => ({ db: mockDb }));
vi.mock('../../database/schema', () => ({ category, balance }));
vi.mock('elysia', () => ({ status: mockStatus }));
vi.mock('drizzle-orm', () => ({
    and: vi.fn((...args) => args),
    eq: vi.fn((...args) => args),
}));


// --- Mock Data ---
const MOCK_USER_ID = 'user-test-123';
const MOCK_CATEGORY_ID = 101;
const MOCK_CREATE_BODY = { name: 'Groceries', type: 'Expense' };
const MOCK_UPDATE_BODY = { name: 'Salary', type: 'Income' };
const MOCK_CATEGORY_RECORD = {
    id: MOCK_CATEGORY_ID,
    name: 'Groceries',
    type: 'Expense',
};
const MOCK_CATEGORY_RECORD_UPDATED = {
    id: MOCK_CATEGORY_ID,
    name: 'Salary',
    type: 'Income',
};


// Reset mocks before each test
beforeEach(() => {
    vi.clearAllMocks();
});


describe('Category Service', () => {

    // --- createCategory Tests ---
    describe('createCategory', () => {
        it('should successfully create and return a new category record', async () => {
            // Arrange: Mock the Drizzle `returning` chain to resolve with the created record
            mockDb.returning.mockResolvedValueOnce([MOCK_CATEGORY_RECORD]);

            // Act
            const result = await createCategory(MOCK_CREATE_BODY, MOCK_USER_ID);

            // Assert
            expect(mockDb.insert).toHaveBeenCalledTimes(1);
            expect(mockDb.values).toHaveBeenCalledWith({
                userID: MOCK_USER_ID,
                name: MOCK_CREATE_BODY.name,
                type: MOCK_CREATE_BODY.type,
            });
            expect(result).toEqual(MOCK_CATEGORY_RECORD);
        });

        it('should throw a 400 error if the new record cannot be retrieved', async () => {
            // Arrange: Simulate a failure to retrieve the returning data
            mockDb.returning.mockResolvedValueOnce([]);

            // Act & Assert
            await expect(createCategory(MOCK_CREATE_BODY, MOCK_USER_ID))
                .rejects.toThrow('Bad Request, Cannot create a new category');
            expect(mockStatus).toHaveBeenCalledWith(400, "Bad Request, Cannot create a new category");
        });
    });

    // --- readCategory (All) Tests ---
    describe('readCategory', () => {
        it('should return all categories for a given user ID', async () => {
            // Arrange: Mock the query result
            const mockRows = [MOCK_CATEGORY_RECORD, { ...MOCK_CATEGORY_RECORD, id: 102, name: 'Taxes' }];
            mockDb.where.mockResolvedValueOnce(mockRows); // where is the last call in the chain

            // Act
            const result = await readCategory(MOCK_USER_ID);

            // Assert
            expect(mockDb.where).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockRows);
        });
        
        // Note: The original code's check `if (!row) throw status(404, 'Not Found')` is highly unlikely to be met,
        // as Drizzle's select queries return an empty array `[]` on no results, which is truthy in JavaScript.
        // We only test the success path as the failure path is an anticipated bug in the service logic.
    });

    // --- readCategoryByID Tests ---
    describe('readCategoryByID', () => {
        const getParam = { id: MOCK_CATEGORY_ID };

        it('should return a specific category record by ID and user ID', async () => {
            // Arrange: $count must return 1 (found), select must return the record
            mockDb.$count.mockResolvedValueOnce(1);
            mockDb.where.mockResolvedValueOnce([MOCK_CATEGORY_RECORD]);

            // Act
            const result = await readCategoryByID(getParam, MOCK_USER_ID);

            // Assert
            expect(mockDb.$count).toHaveBeenCalledTimes(1);
            expect(result).toEqual(MOCK_CATEGORY_RECORD);
        });

        it('should throw a 404 error if the category ID is not found for the user', async () => {
            // Arrange: $count must return 0 (not found)
            mockDb.$count.mockResolvedValueOnce(0);

            // Act & Assert
            await expect(readCategoryByID(getParam, MOCK_USER_ID))
                .rejects.toThrow('Not Found');
            expect(mockStatus).toHaveBeenCalledWith(404, 'Not Found');
        });
    });

    // --- updateCategory Tests ---
    describe('updateCategory', () => {
        const getParam = { id: MOCK_CATEGORY_ID };

        it('should successfully update and return the updated category record', async () => {
            // Arrange: $count must return 1, update must return the updated record
            mockDb.$count.mockResolvedValueOnce(1);
            mockDb.returning.mockResolvedValueOnce([MOCK_CATEGORY_RECORD_UPDATED]);

            // Act
            const result = await updateCategory(getParam, MOCK_UPDATE_BODY, MOCK_USER_ID);

            // Assert
            expect(mockDb.update).toHaveBeenCalledTimes(1);
            expect(mockDb.set).toHaveBeenCalledWith({
                name: MOCK_UPDATE_BODY.name,
                type: MOCK_UPDATE_BODY.type,
            });
            expect(result).toEqual(MOCK_CATEGORY_RECORD_UPDATED);
        });

        it('should throw a 404 error if the category ID to update does not exist', async () => {
            // Arrange: $count must return 0
            mockDb.$count.mockResolvedValueOnce(0);

            // Act & Assert
            await expect(updateCategory(getParam, MOCK_UPDATE_BODY, MOCK_USER_ID))
                .rejects.toThrow('Not Found');
            expect(mockStatus).toHaveBeenCalledWith(404, 'Not Found');
        });

        it('should throw a 400 error if update fails to return a row', async () => {
            // Arrange: $count must return 1, but update returns nothing
            mockDb.$count.mockResolvedValueOnce(1);
            mockDb.returning.mockResolvedValueOnce([]); 

            // Act & Assert
            await expect(updateCategory(getParam, MOCK_UPDATE_BODY, MOCK_USER_ID))
                .rejects.toThrow('Bad Request');
            expect(mockStatus).toHaveBeenCalledWith(400, 'Bad Request');
        });
    });

    // --- deleteCategory Tests ---
    describe('deleteCategory', () => {
        const deleteParam = { id: MOCK_CATEGORY_ID };

        it('should successfully delete a category record', async () => {
            // Arrange: $count must return 1 (found), delete is called
            mockDb.$count.mockResolvedValueOnce(1);
            mockDb.delete.mockReturnThis();
            mockDb.where.mockResolvedValueOnce(undefined);

            // Act
            const result = await deleteCategory(deleteParam, MOCK_USER_ID);

            // Assert
            expect(mockDb.delete).toHaveBeenCalledTimes(1);
            expect(result).toBe("Category deleted successfully");
        });

        it('should throw a 404 error if the category ID to delete is not found', async () => {
            // Arrange: $count must return 0 (not found)
            mockDb.$count.mockResolvedValueOnce(0);

            // Act & Assert
            await expect(deleteCategory(deleteParam, MOCK_USER_ID))
                .rejects.toThrow('Not Found');
            expect(mockStatus).toHaveBeenCalledWith(404, 'Not Found');
        });
    });
});