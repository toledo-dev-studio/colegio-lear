-- Drop old studens table if exists (typo in original)
DROP TABLE IF EXISTS core.studens;

-- Create students table
CREATE TABLE core.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  first_last_name VARCHAR(100) NOT NULL,
  second_last_name VARCHAR(100) NOT NULL,
  date_of_birth TIMESTAMP NOT NULL,
  curp VARCHAR(18) NOT NULL UNIQUE,
  enrollment VARCHAR(20) NOT NULL UNIQUE,
  image VARCHAR(500),
  observations VARCHAR(1000),
  status BOOLEAN NOT NULL DEFAULT true,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone_number VARCHAR(20) NOT NULL,
  address VARCHAR(300) NOT NULL,
  state VARCHAR(100) NOT NULL,
  municipality VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create blood_type enum
CREATE TYPE core."BloodType" AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

-- Create allergy_severity enum
CREATE TYPE core."AllergySeverity" AS ENUM ('mild', 'moderate', 'severe');

-- Create student_medical_information table
CREATE TABLE core.student_medical_information (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES core.students(id) ON DELETE CASCADE,
  blood_type core."BloodType" NOT NULL,
  emergency_notes VARCHAR(1000)
);

-- Create student_allergies table
CREATE TABLE core.student_allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_information_id UUID NOT NULL REFERENCES core.student_medical_information(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  severity core."AllergySeverity" NOT NULL,
  observations VARCHAR(500)
);

-- Create student_guardian_type enum
CREATE TYPE core."StudentGuardianType" AS ENUM (
  'father', 'mother', 'grandmother', 'grandfather',
  'uncle', 'aunt', 'brother', 'sister',
  'legal-guardian', 'step-father', 'step-mother', 'other'
);

-- Create student_guardians table
CREATE TABLE core.student_guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES core.students(id) ON DELETE CASCADE,
  full_name VARCHAR(200) NOT NULL,
  relationship core."StudentGuardianType" NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(150) NOT NULL,
  is_principal BOOLEAN NOT NULL DEFAULT false,
  emergency_contact BOOLEAN NOT NULL DEFAULT false,
  authorized_to_pick_up BOOLEAN NOT NULL DEFAULT false,
  observations VARCHAR(500)
);
