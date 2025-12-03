-- This migration handles the case where the production database still has the old "posts" table
-- It will rename "posts" to "reviews" if "posts" exists and "reviews" doesn't exist

DO $$
BEGIN
    -- Check if "posts" table exists and "reviews" doesn't exist
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'posts'
    ) AND NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews'
    ) THEN
        -- Rename the table
        ALTER TABLE "posts" RENAME TO "reviews";
        
        -- Rename related sequences if they exist
        IF EXISTS (SELECT FROM pg_class WHERE relname = 'posts_id_seq') THEN
            ALTER SEQUENCE "posts_id_seq" RENAME TO "reviews_id_seq";
        END IF;
        
        -- Update foreign key constraints that reference "posts"
        -- Note: PostgreSQL automatically updates foreign key constraints when tables are renamed
        -- But we need to check and update any indexes or constraints with "posts" in the name
        
        RAISE NOTICE 'Successfully renamed "posts" table to "reviews"';
    ELSIF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'posts'
    ) AND EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews'
    ) THEN
        -- Both tables exist - this shouldn't happen, but we'll log it
        RAISE NOTICE 'Both "posts" and "reviews" tables exist. Manual intervention may be required.';
    ELSE
        -- "reviews" table already exists or "posts" doesn't exist - nothing to do
        RAISE NOTICE 'No action needed - "reviews" table exists or "posts" table does not exist';
    END IF;
END $$;

