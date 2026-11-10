-- ============================================================================
-- CANG JING GE (The Sacred SQL Archive of the 6-Story, 36-Chamber Pagoda)
-- ============================================================================

-- 1. TABLE 1: The 6 Floors of the Pagoda (PagodaFloors)
CREATE TABLE PagodaFloors (
    floorId INT PRIMARY KEY,
    floorNumber INT,
    weaponName VARCHAR(50),
    shaolinPractice VARCHAR(80),
    floorTheme VARCHAR(30)
);

-- 2. TABLE 2: The 36 Training Chambers (DojoChambers)
CREATE TABLE DojoChambers (
    chamberId INT PRIMARY KEY,
    chamberTitle VARCHAR(100),
    mastery DECIMAL(5, 2),
    floorId INT,
    studyNotes VARCHAR(255),
    FOREIGN KEY (floorId) REFERENCES PagodaFloor(floorId)
);

-- 3. POPULATING THE 6 FLOORS (INSERT INTO PagodaFloors)
INSERT INTO PagodaFloors (floorId, floorNumber, weaponName, shaolinPractice, floorTheme) VALUES
(1, 1, 'HTML5', '⛰️ Zhan Zhuang (Pillar Posture)', 'theme-stone'),
(2, 2, 'CSS3', '🌊 Rou Quan (The Fluid Fist of Water)', 'theme-water'),
(3, 3, 'JavaScript', '⚡ Qi Gong (Mastery of Internal Energy)', 'theme-lightning'),
(4, 4, 'SQL', '📜 Cang Jing  Ge (Sacred Archive of the Sutras)', 'theme-forge'),
(5, 5, 'C# (.NET)', '🗡️ Bing Qi & Jin Gang (The Steel Guardian)', 'theme-forge'),
(6, 6, 'Fullstack', '⛩️ Chan Wu Yi (Illumination of Room 36)', 'theme-cosmos');

-- 4. POPULATING THE TRAINING CHAMBERS (INSERT INTO DojoChambers)
-- Mastery values ​​are real numbers (DECIMAL) between 0.00 and 4.00!
INSERT INTO DojoChambers (chamberId, chamberTitle, mastery, floorId, studyNotes) VALUES
-- 1st Floor: HTML5 (Rooms 1 - 5)
(1, 'Document Anatomy & Semantic Tags', 4.0, 1, 'Structure: <!DOCTYPE html>, <head>, <header>, <main>, <section>, <footer>.'),
(2, 'Text, Lists & Hyperlinks', 3.0, 1, 'Headings <h1>–<h6>, paragraphs <p>, lists <ul>/<li>, and links <a href target="_blank">.'),
(3, 'HTML Tables Architecture', 2.0, 1, 'Building tables: <table>, <thead>, <tbody>, <tr>, <th>, <td>.'),
(4, 'Interactive Forms & Inputs', 1.0, 1, 'Collecting data from travelers: <form>, <input>, <select>, <button>.'),
(5, 'SVG Vector Graphics & Focus', 2.0, 1, 'Drawing a Torii gate via code using <svg viewBox>, <rect>, <path>, and tabindex="0".'),

-- 2nd Floor: CSS3 (Rooms 6 - 12)
(6, 'Selectors, Variables & Pseudo-classes', 3.0, 2, 'Variables in :root (--var), selectors (.class, #id), :hover, :focus, :has().'),
(7, 'Box Model & Spatial Positioning', 3.0, 2, 'Margin, padding, border, positioning (relative, absolute, fixed), and z-index layers.'),
(8, 'Flexbox 1D Alignment', 2.0, 2, 'Single-axis alignment using display: flex, justify-content, align-items, and gap.'),
(9, 'CSS Grid 2D Architecture', 1.0, 2, '2D layout architecture using display: grid and grid-template-columns.'),
(10, 'Colors, Gradients & Shadows', 2.0, 2, 'Atmosphere created with rgba(), hsl(), linear-gradient, radial-gradient, and box-shadow.'),
(11, '3D Perspective & Transitions', 1.5, 2, '3D space using perspective: 1000px, rotateX(), scale(), and transition.'),
(12, 'Responsive Technique', 1.5, 2, 'Adapting to any screen size using vw, vh, clamp(), and @media queries.'),

-- Floor 3: JavaScript (Rooms 13 - 20)
(13, 'Variables, Data Types & Operators', 2.5, 3, 'Storage containers (const and let), strings, numbers, concatenation with +, and strict equality (===).'),
(14, 'Functions, Parameters & Scope', 2.0, 3, 'Function declarations, arrow functions (=>), and the boundaries defined by curly braces { }.'),
(15, 'Conditional Logic (If / Else)', 2.0, 3, 'Branching paths using if, else if, and else, plus checking for existence with if (element).'),
(16, 'Arrays, Objects & forEach Loops', 1.0, 3, 'Lists [ ], objects { }, and the .forEach() and .find() methods for iterating through data.'),
(17, 'DOM Selection & Manipulation', 2.5, 3, 'Connecting to the DOM using querySelector, getElementById, .innerHTML, .classList, and createElement.'),
(18, 'Events & User Interaction', 2.0, 3, 'Using addEventListener to listen for clicks, stopPropagation(), and handling user actions.'),
(19, 'Async Fetch & JSON APIs', 1.5, 3, 'Asynchronous operations with fetch(url), .then(res => res.json()), and the .catch() safety net.'),
(20, 'Browser & VS Code Debugging', 3.0, 3, 'Hunting down errors in the Console (TypeError, ReferenceError) and the Elements (Styles) panel.'),

-- Floor 4: SQL (Rooms 21 - 26)
(21, 'Tables Architecture & Keys', 2.0, 4, 'CREATE TABLE, data types INT, VARCHAR(n), DECIMAL(5,2), PRIMARY KEY, and FOREIGN KEY.'),
(22, 'Reading & Filtering Data (SELECT)', 2.0, 4, 'Extracting data using SELECT and FROM, filtering with WHERE, and sorting with ORDER BY.'),
(23, 'Modifying Data (Full CRUD)', 1.0, 4, 'Adding data with INSERT INTO, refining records with UPDATE SET, and removing data with DELETE FROM.'),
(24, 'Relational Joins (INNER JOIN)', 1.5, 4, 'Joining two datasets (Floors + Rooms) using the connecting link: ON PK = FK.'),
(25, 'Aggregation & Grouping', 0.0, 4, 'Statistical calculations in SQL: COUNT(), SUM(), AVG(), and grouping with GROUP BY.'),
(26, 'Subqueries, Views & Security', 0.0, 4, 'Nested queries and securing the vault against SQL Injection.'),

-- 5th Floor: C# .NET (Rooms 27 - 33)
(27, 'C# Syntax, Strong Types & Console', 1.5, 5, 'Typed containers: int, double, string, bool; class/Main structure and Console.WriteLine.'),
(28, 'Control Flow & Loops in C#', 1.0, 5, 'if/else and switch statements; for, while, and foreach loops in C#.'),
(29, 'Methods, Parameters & Exceptions', 0.0, 5, 'Typed methods (public/private), return statements, and error handling using try/catch.'),
(30, 'OOP Part 1: Classes & Objects', 0.0, 5, 'Defining classes, objects, constructors, and properties using { get; set; }.'),
(31, 'OOP Part 2: The 4 Pillars', 0.0, 5, 'Encapsulation, Inheritance (:), Polymorphism, and Interfaces in C#.'),
(32, 'Collections & LINQ Queries', 0.0, 5, 'Dynamic lists (List<T>) and querying data directly from C# using LINQ.'),
(33, 'ASP.NET Core Web API Guardian', 0.0, 5, 'Building a C# server that guards the SQL database and responds to the fetch() "hawk".'),

-- Level 6: Fullstack, Git & Server (Rooms 34 - 36)
(34, 'Git & GitHub Version Control', 0.0, 6, 'Creating save points using git init, add, commit, and push, and publishing to GitHub Pages.'),
(35, 'Clean Architecture & Modular Code', 1.5, 6, 'Separating responsibilities across HTML, CSS, JS, SQL, and C# files.'),
(36, 'The 36th Chamber: Fullstack & Hetzner', 0.0, 6, 'The ultimate fusion of JS + C# + SQL, and deployment to a Hetzner server with a custom domain.');

-- 5. THE SUPREME INQUIRY FROM CANG JING GE (Uniting the Levels with the Chambers)
SELECT
    PagodaFloors.floorNumber,
    PagodaFloors.weaponName,
    PagodaFloors.shaolinPractice,
    DojoChambers.chamberId,
    DojoChambers.chamberTitle,
    DojoChambers.mastery
FROM DojoChambers
INNER JOIN PagodaFloors ON DojoChambers.floorId = PagodaFloors.floorId
ORDER BY DojoChambers.chamberId ASC;