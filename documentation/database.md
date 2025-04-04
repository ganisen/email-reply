# Database Schema

Description of the database schema, including each table and its columns.

## email_reply=# \l
                                                      List of databases
     Name     |  Owner   | Encoding | Locale Provider |  Collate   |   Ctype    | Locale | ICU Rules |   Access privileges
--------------+----------+----------+-----------------+------------+------------+--------+-----------+-----------------------
 email_reply  | postgres | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           |

## email_reply=# \d
                   List of relations
 Schema |          Name           |   Type   |  Owner
--------+-------------------------+----------+----------
 public | email_metadata          | table    | postgres
 public | email_metadata_id_seq   | sequence | postgres
 public | response_actions        | table    | postgres
 public | response_actions_id_seq | sequence | postgres
 public | response_logs           | table    | postgres
 public | response_logs_id_seq    | sequence | postgres
(6 rows)

## email_reply=# \d email_metadata
                                         Table "public.email_metadata"
     Column      |           Type           | Collation | Nullable |                  Default
-----------------+--------------------------+-----------+----------+--------------------------------------------
 id              | integer                  |           | not null | nextval('email_metadata_id_seq'::regclass)
 token           | character varying(64)    |           | not null |
 sender_email    | character varying(255)   |           | not null |
 recipient_email | character varying(255)   |           | not null |
 subject         | text                     |           | not null |
 content         | text                     |           | not null |
 created_at      | timestamp with time zone |           |          | now()
 expires_at      | timestamp with time zone |           |          |
 is_active       | boolean                  |           |          | true
Indexes:
    "email_metadata_pkey" PRIMARY KEY, btree (id)
    "email_metadata_token_key" UNIQUE CONSTRAINT, btree (token)
    "idx_expires_at" btree (expires_at)
    "idx_token" btree (token)
Referenced by:
    TABLE "response_actions" CONSTRAINT "response_actions_email_id_fkey" FOREIGN KEY (email_id) REFERENCES email_metadata(id) ON DELETE CASCADE
    TABLE "response_logs" CONSTRAINT "response_logs_token_fkey" FOREIGN KEY (token) REFERENCES email_metadata(token) ON DELETE CASCADE

## email_reply=# \d response_actions
                                        Table "public.response_actions"
    Column     |           Type           | Collation | Nullable |                   Default
---------------+--------------------------+-----------+----------+----------------------------------------------
 id            | integer                  |           | not null | nextval('response_actions_id_seq'::regclass)
 email_id      | integer                  |           |          |
 action_type   | character varying(50)    |           | not null |
 response_text | text                     |           | not null |
 created_at    | timestamp with time zone |           |          | now()
Indexes:
    "response_actions_pkey" PRIMARY KEY, btree (id)
    "idx_email_id" btree (email_id)
Foreign-key constraints:
    "response_actions_email_id_fkey" FOREIGN KEY (email_id) REFERENCES email_metadata(id) ON DELETE CASCADE

## email_reply=# \d response_logs
                                        Table "public.response_logs"
    Column     |           Type           | Collation | Nullable |                  Default
---------------+--------------------------+-----------+----------+-------------------------------------------
 id            | integer                  |           | not null | nextval('response_logs_id_seq'::regclass)
 token         | character varying(64)    |           | not null |
 action_type   | character varying(50)    |           | not null |
 ip_address    | character varying(45)    |           |          |
 user_agent    | text                     |           |          |
 response_time | timestamp with time zone |           |          | now()
Indexes:
    "response_logs_pkey" PRIMARY KEY, btree (id)
    "idx_token_log" btree (token)
Foreign-key constraints:
    "response_logs_token_fkey" FOREIGN KEY (token) REFERENCES email_metadata(token) ON DELETE CASCADE
