INSERT INTO account(name, ID) VALUES
    ('Cowan', 'Account1');

INSERT INTO GAME(CREATE_TIME, ID) VALUES
    ('2024-08-05', 'Game1');

INSERT INTO BUY_IN(ACCOUNT_ID, AMOUNT, CREATE_TIME, GAME_ID, ID) VALUES
    ('Account1', 50, '2024-08-06', 'Game1', 'BuyIn1'),
    ('Account1', 100, '2024-08-07', 'Game1', 'BuyIn2');
