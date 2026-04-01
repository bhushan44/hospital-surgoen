-- ============================================================
-- Seed Data: Procedure Hierarchy (Specific IDs Version)
-- Specialty -> Category -> Procedure -> Type
-- ============================================================

-- 1. Ensure Procedure Types exist
INSERT INTO "procedure_types" ("name", "display_name") VALUES
    ('standard', 'Standard'),
    ('open', 'Open'),
    ('laparoscopy', 'Laparoscopy')
ON CONFLICT ("name") DO NOTHING;

-- 2. Create Categories under existing Specialties
-- Surgery ID: 0843dbd1-161c-43fc-a914-8c3c19d46ef1
-- Gynecology ID: 48c011f5-a25c-4604-8bde-981b56c7a166

DO $$ 
DECLARE 
    spec_record RECORD;
    cat_id uuid;
    spec_id uuid;
BEGIN 
    -- Iterate through all specialties we want to seed procedures for
    -- We will use the names from the provided list to find IDs
    
    -- cardiology
    SELECT id INTO spec_id FROM "specialties" WHERE "name" = 'Cardiology';
    IF spec_id IS NOT NULL THEN
        INSERT INTO "procedure_categories" (specialty_id, name, description) 
        VALUES (spec_id, 'Cardiology Procedures', 'Heart and blood vessel procedures')
        ON CONFLICT (specialty_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
        
        INSERT INTO "procedures" (specialty_id, category_id, name) VALUES
            (spec_id, cat_id, 'Angiography'), (spec_id, cat_id, 'Angioplasty'), (spec_id, cat_id, 'Echocardiogram'),
            (spec_id, cat_id, 'Pacemaker Implantation'), (spec_id, cat_id, 'ETT (Exercise Tolerance Test)')
        ON CONFLICT (specialty_id, name) DO UPDATE SET category_id = EXCLUDED.category_id;
    END IF;

    -- neurology
    SELECT id INTO spec_id FROM "specialties" WHERE "name" = 'Neurology';
    IF spec_id IS NOT NULL THEN
        INSERT INTO "procedure_categories" (specialty_id, name, description) 
        VALUES (spec_id, 'Neurology Procedures', 'Brain and nervous system procedures')
        ON CONFLICT (specialty_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
        
        INSERT INTO "procedures" (specialty_id, category_id, name) VALUES
            (spec_id, cat_id, 'EEG'), (spec_id, cat_id, 'EMG'), (spec_id, cat_id, 'Lumbar puncture'),
            (spec_id, cat_id, 'Nerve conduction study')
        ON CONFLICT (specialty_id, name) DO UPDATE SET category_id = EXCLUDED.category_id;
    END IF;

    -- orthopedics
    SELECT id INTO spec_id FROM "specialties" WHERE "name" = 'Orthopedics';
    IF spec_id IS NOT NULL THEN
        INSERT INTO "procedure_categories" (specialty_id, name, description) 
        VALUES (spec_id, 'Orthopedic Procedures', 'Bone and joint procedures')
        ON CONFLICT (specialty_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
        
        INSERT INTO "procedures" (specialty_id, category_id, name) VALUES
            (spec_id, cat_id, 'Knee replacement'), (spec_id, cat_id, 'Hip replacement'), (spec_id, cat_id, 'Arthroscopy'),
            (spec_id, cat_id, 'Fracture reduction'), (spec_id, cat_id, 'Spine surgery')
        ON CONFLICT (specialty_id, name) DO UPDATE SET category_id = EXCLUDED.category_id;
    END IF;

    -- pediatrics
    SELECT id INTO spec_id FROM "specialties" WHERE "name" = 'Pediatrics';
    IF spec_id IS NOT NULL THEN
        INSERT INTO "procedure_categories" (specialty_id, name, description) 
        VALUES (spec_id, 'Pediatric Procedures', 'Medical procedures for children')
        ON CONFLICT (specialty_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
        
        INSERT INTO "procedures" (specialty_id, category_id, name) VALUES
            (spec_id, cat_id, 'Vaccinations'), (spec_id, cat_id, 'Circumcision'), (spec_id, cat_id, 'Nebulization')
        ON CONFLICT (specialty_id, name) DO UPDATE SET category_id = EXCLUDED.category_id;
    END IF;

    -- dermatology
    SELECT id INTO spec_id FROM "specialties" WHERE "name" = 'Dermatology';
    IF spec_id IS NOT NULL THEN
        INSERT INTO "procedure_categories" (specialty_id, name, description) 
        VALUES (spec_id, 'Dermatology Procedures', 'Skin related procedures')
        ON CONFLICT (specialty_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
        
        INSERT INTO "procedures" (specialty_id, category_id, name) VALUES
            (spec_id, cat_id, 'Skin biopsy'), (spec_id, cat_id, 'Mole removal'), (spec_id, cat_id, 'Cryotherapy'),
            (spec_id, cat_id, 'Laser treatment')
        ON CONFLICT (specialty_id, name) DO UPDATE SET category_id = EXCLUDED.category_id;
    END IF;

    -- oncology
    SELECT id INTO spec_id FROM "specialties" WHERE "name" = 'Oncology';
    IF spec_id IS NOT NULL THEN
        INSERT INTO "procedure_categories" (specialty_id, name, description) 
        VALUES (spec_id, 'Oncology Procedures', 'Cancer related treatments')
        ON CONFLICT (specialty_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
        
        INSERT INTO "procedures" (specialty_id, category_id, name) VALUES
            (spec_id, cat_id, 'Chemotherapy infusion'), (spec_id, cat_id, 'Biopsy'), (spec_id, cat_id, 'Radiation therapy')
        ON CONFLICT (specialty_id, name) DO UPDATE SET category_id = EXCLUDED.category_id;
    END IF;

    -- ophthalmology
    SELECT id INTO spec_id FROM "specialties" WHERE "name" = 'Ophthalmology';
    IF spec_id IS NOT NULL THEN
        INSERT INTO "procedure_categories" (specialty_id, name, description) 
        VALUES (spec_id, 'Ophthalmic Procedures', 'Eye related surgeries')
        ON CONFLICT (specialty_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
        
        INSERT INTO "procedures" (specialty_id, category_id, name) VALUES
            (spec_id, cat_id, 'Cataract surgery'), (spec_id, cat_id, 'LASIK'), (spec_id, cat_id, 'Glaucoma surgery'),
            (spec_id, cat_id, 'Retinal surgery')
        ON CONFLICT (specialty_id, name) DO UPDATE SET category_id = EXCLUDED.category_id;
    END IF;

    -- ent
    SELECT id INTO spec_id FROM "specialties" WHERE "name" = 'ENT';
    IF spec_id IS NOT NULL THEN
        INSERT INTO "procedure_categories" (specialty_id, name, description) 
        VALUES (spec_id, 'ENT Procedures', 'Ear, Nose and Throat procedures')
        ON CONFLICT (specialty_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
        
        INSERT INTO "procedures" (specialty_id, category_id, name) VALUES
            (spec_id, cat_id, 'Tonsillectomy'), (spec_id, cat_id, 'Septoplasty'), (spec_id, cat_id, 'Tympanoplasty'),
            (spec_id, cat_id, 'Cochlear implant')
        ON CONFLICT (specialty_id, name) DO UPDATE SET category_id = EXCLUDED.category_id;
    END IF;

    -- surgery
    SELECT id INTO spec_id FROM "specialties" WHERE "name" = 'Surgery';
    IF spec_id IS NOT NULL THEN
        INSERT INTO "procedure_categories" (specialty_id, name, description) 
        VALUES (spec_id, 'General Surgery', 'Standard surgical procedures')
        ON CONFLICT (specialty_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
        
        INSERT INTO "procedures" (specialty_id, category_id, name) VALUES
            (spec_id, cat_id, 'Appendicectomy'), (spec_id, cat_id, 'Gall bladder'), (spec_id, cat_id, 'Hernia'),
            (spec_id, cat_id, 'Laparotomy'), (spec_id, cat_id, 'Piles / Fissure / Fistula'),
            (spec_id, cat_id, 'Incision & Drainage (I & D) for abscess'), (spec_id, cat_id, 'Nail removal'),
            (spec_id, cat_id, 'Lipoma / Sebaceous cyst'), (spec_id, cat_id, 'CLW'), (spec_id, cat_id, 'Ear lobe repair')
        ON CONFLICT (specialty_id, name) DO UPDATE SET category_id = EXCLUDED.category_id;
    END IF;

    -- gynecology
    SELECT id INTO spec_id FROM "specialties" WHERE "name" = 'Gynecology';
    IF spec_id IS NOT NULL THEN
        INSERT INTO "procedure_categories" (specialty_id, name, description) 
        VALUES (spec_id, 'Gynecology Procedures', 'Obstetrics and Gynecology procedures')
        ON CONFLICT (specialty_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
        
        INSERT INTO "procedures" (specialty_id, category_id, name) VALUES
            (spec_id, cat_id, 'Hysterectomy'), (spec_id, cat_id, 'LSCS'), (spec_id, cat_id, 'MTP'),
            (spec_id, cat_id, 'Bartholin cyst'), (spec_id, cat_id, 'Ovarian cyst'), (spec_id, cat_id, 'Ectopic'),
            (spec_id, cat_id, 'Myomectomy'), (spec_id, cat_id, 'Hysteroscopy')
        ON CONFLICT (specialty_id, name) DO UPDATE SET category_id = EXCLUDED.category_id;
    END IF;

    -- urology
    SELECT id INTO spec_id FROM "specialties" WHERE "name" = 'Urology';
    IF spec_id IS NOT NULL THEN
        INSERT INTO "procedure_categories" (specialty_id, name, description) 
        VALUES (spec_id, 'Urology Procedures', 'Urinary tract procedures')
        ON CONFLICT (specialty_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
        
        INSERT INTO "procedures" (specialty_id, category_id, name) VALUES
            (spec_id, cat_id, 'Nephrectomy'), (spec_id, cat_id, 'Varicocele'), (spec_id, cat_id, 'Hydrocele'),
            (spec_id, cat_id, 'Cystoscopy'), (spec_id, cat_id, 'TURP')
        ON CONFLICT (specialty_id, name) DO UPDATE SET category_id = EXCLUDED.category_id;
    END IF;

    -- psychiatry
    SELECT id INTO spec_id FROM "specialties" WHERE "name" = 'Psychiatry';
    IF spec_id IS NOT NULL THEN
        INSERT INTO "procedure_categories" (specialty_id, name, description) 
        VALUES (spec_id, 'Psychiatric Procedures', 'Mental health diagnostic procedures')
        ON CONFLICT (specialty_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
        
        INSERT INTO "procedures" (specialty_id, category_id, name) VALUES
            (spec_id, cat_id, 'Psychotherapy session'), (spec_id, cat_id, 'ECT'), (spec_id, cat_id, 'Mental state examination')
        ON CONFLICT (specialty_id, name) DO UPDATE SET category_id = EXCLUDED.category_id;
    END IF;

    -- radiology
    SELECT id INTO spec_id FROM "specialties" WHERE "name" = 'Radiology';
    IF spec_id IS NOT NULL THEN
        INSERT INTO "procedure_categories" (specialty_id, name, description) 
        VALUES (spec_id, 'Radiology Procedures', 'Imaging procedures')
        ON CONFLICT (specialty_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
        
        INSERT INTO "procedures" (specialty_id, category_id, name) VALUES
            (spec_id, cat_id, 'X-ray'), (spec_id, cat_id, 'MRI scan'), (spec_id, cat_id, 'CT scan'),
            (spec_id, cat_id, 'Ultrasound'), (spec_id, cat_id, 'PET scan')
        ON CONFLICT (specialty_id, name) DO UPDATE SET category_id = EXCLUDED.category_id;
    END IF;

    -- gastroenterology
    SELECT id INTO spec_id FROM "specialties" WHERE "name" = 'Gastroenterology';
    IF spec_id IS NOT NULL THEN
        INSERT INTO "procedure_categories" (specialty_id, name, description) 
        VALUES (spec_id, 'GI Procedures', 'Digestive system procedures')
        ON CONFLICT (specialty_id, name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;
        
        INSERT INTO "procedures" (specialty_id, category_id, name) VALUES
            (spec_id, cat_id, 'Gastroscopy'), (spec_id, cat_id, 'Colonoscopy'), (spec_id, cat_id, 'ERCP'),
            (spec_id, cat_id, 'Liver biopsy')
        ON CONFLICT (specialty_id, name) DO UPDATE SET category_id = EXCLUDED.category_id;
    END IF;

    -- Create empty categories for all other specialties in the list
    FOR spec_record IN 
        SELECT id, name FROM "specialties" 
        WHERE name IN (
            'Anesthesiology', 'Emergency Medicine', 'Internal Medicine', 'Pulmonology', 'Endocrinology',
            'Nephrology', 'Hematology', 'Rheumatology', 'Infectious Disease', 'Critical Care',
            'Family Medicine', 'Sports Medicine', 'Plastic Surgery', 'Vascular Surgery',
            'Neurosurgery', 'Cardiothoracic Surgery'
        )
    LOOP
        INSERT INTO "procedure_categories" (specialty_id, name, description) 
        VALUES (spec_record.id, spec_record.name || ' Procedures', 'Default procedure category for ' || spec_record.name)
        ON CONFLICT (specialty_id, name) DO NOTHING;
    END LOOP;

END $$;
