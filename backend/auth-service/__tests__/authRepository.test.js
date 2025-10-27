import { jest } from '@jest/globals'

// Mock di pg
const mockQuery = jest.fn();
jest.unstable_mockModule('pg', () => {
    const mPool = {
        query: mockQuery,
        connect: jest.fn(),
        end: jest.fn(),
    };
    return { Pool: jest.fn(()=> mPool)}
});


// Importa il repository solo dopo aver configurato il mock
const { findUser } = await import('../repositories/authRepository.js');

describe('unit test for findUser', () => {

    beforeEach(() => {
        mockQuery.mockReset();
    });
    test('should find a valid user', async () => {
        //Arrange
        const mockUser = {
            Id : 1,
            username : "alex",
            email : "alex@gmail.com"
        };

        const mockQueryResult = {
            rows: [mockUser],
            rowCount: 1,
        };
        
        mockQuery.mockResolvedValueOnce(mockQueryResult);

        const email = 'alex@gmail.com';

        //Act
        const result = await findUser(email);


        //Assert
        expect(mockQuery).toHaveBeenCalledWith(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        //Verify
        expect(result.rows[0]).toEqual(mockUser);
        expect(result.rowCount).toBe(1);

    })

    test('should not find a valid user ', async () => {
        //Arrange
        const mockQueryResult = {
            rows: [],
            rowCount: 0,
        };
        
        mockQuery.mockResolvedValueOnce(mockQueryResult);

        const email = 'adsfsfx@gmail.com';

        //Act
        const result = await findUser(email);


        //Assert
        expect(mockQuery).toHaveBeenCalledWith(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        //Verify
        expect(result.rows[0]).toBeUndefined();
        expect(result.rows).toEqual([]);
        expect(result.rowCount).toBe(0);

    })
})

// sintassi import dimamico:
// const { ... } = await import('...');
// Use case: 
// 1. nei test quando devi Mockare Dipendenze:
// Ad esempio, quando un modulo crea istanze di classi o oggetti al momento dell'importazione.
// 2. Vuoi Controllare l'Ordine di Esecuzione:
// Assicurarti che il mock sia configurato prima che il modulo venga caricato.