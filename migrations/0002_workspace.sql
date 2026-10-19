CREATE TABLE workspaces (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE memberships (workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE, user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE, role TEXT NOT NULL CHECK(role IN ('owner','admin','member','viewer')), PRIMARY KEY(workspace_id,user_id));
CREATE INDEX memberships_user ON memberships(user_id);
CREATE TABLE records (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','archived')), revision INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE INDEX records_workspace ON records(workspace_id,updated_at,id);
CREATE TABLE files (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE, owner_id TEXT NOT NULL REFERENCES auth_users(id), name TEXT NOT NULL, object_key TEXT NOT NULL UNIQUE, mime TEXT NOT NULL, bytes INTEGER NOT NULL, created_at INTEGER NOT NULL);
CREATE INDEX files_workspace ON files(workspace_id,created_at);
CREATE TABLE request_limits (key TEXT NOT NULL, period INTEGER NOT NULL, count INTEGER NOT NULL, PRIMARY KEY(key,period));
