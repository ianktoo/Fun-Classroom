-- This script seeds the database with test data.
-- IMPORTANT: Replace '904b3b55-6640-4f1f-8945-1bc8cab7ec2d' with your actual user ID from the Supabase `auth.users` table.

-- Insert sample students for your user
INSERT INTO public.students (name, avatar_url, user_id)
VALUES
  ('Liam', 'https://i.pravatar.cc/150?u=liam', '904b3b55-6640-4f1f-8945-1bc8cab7ec2d'),
  ('Olivia', 'https://i.pravatar.cc/150?u=olivia', '904b3b55-6640-4f1f-8945-1bc8cab7ec2d'),
  ('Noah', 'https://i.pravatar.cc/150?u=noah', '904b3b55-6640-4f1f-8945-1bc8cab7ec2d'),
  ('Emma', 'https://i.pravatar.cc/150?u=emma', '904b3b55-6640-4f1f-8945-1bc8cab7ec2d'),
  ('Ava', 'https://i.pravatar.cc/150?u=ava', '904b3b55-6640-4f1f-8945-1bc8cab7ec2d'),
  ('Lucas', 'https://i.pravatar.cc/150?u=lucas', '904b3b55-6640-4f1f-8945-1bc8cab7ec2d');

-- Insert a sample school for your user
INSERT INTO public.schools (name, user_id)
VALUES
  ('Galaxy Elementary School', '904b3b55-6640-4f1f-8945-1bc8cab7ec2d');

-- Insert sample lessons for your user
INSERT INTO public.lessons (title, description, user_id)
VALUES
  ('The Magic of Magnetism', 'A hands-on lesson exploring magnetic fields and forces.', '904b3b55-6640-4f1f-8945-1bc8cab7ec2d'),
  ('Journey Through the Solar System', 'Building a model of the planets and learning a fun fact about each one.', '904b3b55-6640-4f1f-8945-1bc8cab7ec2d'),
  ('Creative Story Writing', 'An introduction to character, setting, and plot for budding authors.', '904b3b55-6640-4f1f-8945-1bc8cab7ec2d');
