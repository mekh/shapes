DROP TABLE IF EXISTS Colors CASCADE;
DROP TABLE IF EXISTS Rooms CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

CREATE TABLE Colors (
    Id serial,
    Color varchar(64) NOT NULL
);

ALTER TABLE Colors ADD CONSTRAINT colors_pkey PRIMARY KEY (Id);
CREATE UNIQUE INDEX colors_color_key ON Colors (Color);

INSERT INTO Colors (color) VALUES('red'), ('blue'), ('green');

CREATE TABLE Rooms (
    Id serial,
    Room varchar(64) NOT NULL,
    Color integer DEFAULT 1
);

ALTER TABLE Rooms ADD CONSTRAINT rooms_pkey PRIMARY KEY (Id);
ALTER TABLE Rooms ADD CONSTRAINT fk_color_id FOREIGN KEY (color) REFERENCES colors (Id) ON DELETE CASCADE;

CREATE UNIQUE INDEX rooms_room_key ON Rooms (Room);

CREATE TABLE Users (
    Id serial,
    Name varchar(255),
    Room integer
);


ALTER TABLE Users ADD CONSTRAINT users_pkey PRIMARY KEY (Id);
ALTER TABLE Users ADD CONSTRAINT fk_room_id FOREIGN KEY (room) REFERENCES rooms (Id) ON DELETE SET NULL;

CREATE UNIQUE INDEX users_name_key ON Users (Name);
