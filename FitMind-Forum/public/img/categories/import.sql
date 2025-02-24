INSERT INTO [FitMindDB].[dbo].[Categories] 
    ([Name], [Description], [ImageUrl], [IsActive], [CreatedAt], [UpdatedAt]) 
VALUES
    ('Bodybuilding & Muscle Gain', 'Category for muscle gain and bodybuilding tips', 'img/categories/Bodybuilding & Muscle Gain.jpg', 1, GETDATE(), GETDATE()),
    ('Fitness & Exercise', 'General fitness and exercise discussions', 'img/categories/Fitness & Exercise.jpg', 1, GETDATE(), GETDATE()),
    ('Fitness Challenges', 'Engage in fitness challenges', 'img/categories/Fitness Challenges.png', 1, GETDATE(), GETDATE()),
    ('Fitness Community', 'Connect with other fitness enthusiasts', 'img/categories/Fitness Community.png', 1, GETDATE(), GETDATE()),
    ('Fitness Gear & Equipment', 'Discussion about fitness gear and equipment', 'img/categories/Fitness Gear & Equipment.png', 1, GETDATE(), GETDATE()),
    ('Gym', 'All about gym workouts and training', 'img/categories/Gym.jpg', 1, GETDATE(), GETDATE()),
    ('Injury Prevention', 'Tips on avoiding injuries during workouts', 'img/categories/Injury Prevention.jpg', 1, GETDATE(), GETDATE()),
    ('Mental Health & Motivation', 'Mental health and motivational discussions', 'img/categories/Mental Health & Motivation.jpg', 1, GETDATE(), GETDATE()),
    ('Nutrition & Diet', 'Talk about diets and nutrition', 'img/categories/Nutrition & Diet.jpg', 1, GETDATE(), GETDATE()),
    ('Personalized Coaching', 'Find and discuss personal coaching', 'img/categories/Personalized Coaching.png', 1, GETDATE(), GETDATE()),
    ('Recovery', 'Guides on recovery after workouts', 'img/categories/recovery.jpg', 1, GETDATE(), GETDATE()),
    ('Supplements', 'Discussion about supplements and their uses', 'img/categories/Supplements.png', 1, GETDATE(), GETDATE()),
    ('Weight Loss & Fat Loss', 'Tips and strategies for weight loss', 'img/categories/Weight Loss & Fat Loss.jpg', 1, GETDATE(), GETDATE());
