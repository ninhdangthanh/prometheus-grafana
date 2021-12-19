import { Client } from 'pg';

interface Tweet {
  id: string;
  message: string;
  created_at: Date;
}

class TweetService {
  private pgClient: Client;

  constructor(pgClient: Client) {
    this.pgClient = pgClient;
  }

  async createTable(): Promise<void> {
    const query = `
    CREATE TABLE IF NOT EXISTS tweets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	    created_at TIMESTAMP NOT NULL,
	    message TEXT NOT NULL
    );`;

    await this.pgClient.query(query);
  }

  async listTweets(total = 50): Promise<Array<Tweet>> {
    const res = await this.pgClient.query({
      text: 'SELECT * FROM tweets ORDER BY $1 DESC LIMIT $2',
      values: ['created_at', total],
    });
    return res.rows;
  }

  async createTweet(message: string): Promise<Tweet> {
    const res = await this.pgClient.query({
      text: 'INSERT INTO tweets(message, created_at) VALUES($1, $2) RETURNING *',
      values: [message, new Date()],
    });
    return res.rows[0];
  }
}

export { Tweet, TweetService };
