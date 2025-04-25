-- server/src/db/migrations/01_create_users.sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'voter',
  voter_id VARCHAR(20) UNIQUE NOT NULL,
  aadhaar_id VARCHAR(12) UNIQUE NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  has_voted BOOLEAN DEFAULT FALSE,
  constituency VARCHAR(100) NOT NULL,
  face_data TEXT,
  eth_address VARCHAR(42),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- server/src/db/migrations/02_create_elections.sql
CREATE TABLE IF NOT EXISTS elections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- server/src/db/migrations/03_create_constituencies.sql
CREATE TABLE IF NOT EXISTS constituencies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  election_id INT,
  FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
  UNIQUE KEY unique_name_election (name, election_id)
);

-- server/src/db/migrations/04_create_candidates.sql
CREATE TABLE IF NOT EXISTS candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  party VARCHAR(100) NOT NULL,
  party_symbol VARCHAR(50),
  bio TEXT,
  image_url VARCHAR(255),
  constituency_id INT,
  election_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (constituency_id) REFERENCES constituencies(id) ON DELETE CASCADE,
  FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE
);

-- server/src/db/migrations/05_create_votes.sql
CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  candidate_id INT,
  election_id INT,
  constituency_id INT,
  vote_hash VARCHAR(255) UNIQUE NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
  FOREIGN KEY (constituency_id) REFERENCES constituencies(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_election (user_id, election_id)
);