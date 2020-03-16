CREATE TABLE IF NOT EXISTS history (
  id serial,
  by text DEFAULT current_user,
  at timestamp without time zone DEFAULT now(),
  tab text,
  op text,
  old_json json,
  new_json json
);

DROP TRIGGER IF EXISTS trees_history ON trees;

CREATE OR REPLACE FUNCTION history_trigger() RETURNS trigger AS $$
  BEGIN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO history (tab, op, new_json)
             VALUES (TG_RELNAME, TG_OP, row_to_json(NEW));
      RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
      INSERT INTO history (tab, op, old_json, new_json)
             VALUES (TG_RELNAME, TG_OP, row_to_json(OLD), row_to_json(NEW));
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      INSERT INTO history (tab, op, old_json)
             VALUES (TG_RELNAME, TG_OP, row_to_json(OLD));
      RETURN OLD;
    END IF;
  END;
$$ LANGUAGE 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER trees_history BEFORE INSERT OR UPDATE OR DELETE ON trees
  FOR EACH ROW EXECUTE PROCEDURE history_trigger();
