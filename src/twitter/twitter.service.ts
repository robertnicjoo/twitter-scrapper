import { Injectable } from '@nestjs/common';
import { TwitterApi } from 'twitter-api-v2';
import { promisify } from 'util'; // Import promisify from util module
const sleep = promisify(setTimeout); // Use sleep to wait between retries

@Injectable()
export class TwitterService {
  private twitterClient: TwitterApi;

  constructor() {
    this.twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN); // Use Bearer Token for API v2
  }

  // Fetch tweets using a Twitter USERNAME
  async getUserTweetsFromUserName(twitterUserName: string) {
    const username = twitterUserName;
    if (!username) {
      throw new Error('Invalid Twitter USERNAME or username not found');
    }

    // Now fetch tweets using the extracted username
    return this.getUserTweets(username);
  }

  // Fetch user tweets with retry logic for rate limiting
  async getUserTweets(username: string, tweetCount: number = 10) {
    let retries = 0;
    let backoff = 5000; // Starting with 5 seconds delay
    const maxRetries = 5; // You can adjust the number of retries based on your needs

    // Fetch the user ID first if not already a valid ID
    const userId = await this.getUserIdFromUsername(username);

    // throw new Error('Max retry attempts exceeded'); // Throw error if retries are exhausted
    while (retries < maxRetries) {
      try {
        const userTweets = await this.twitterClient.v2.userTimeline(userId, {
          max_results: tweetCount, // Specify number of tweets to fetch
          exclude: ['retweets', 'replies'], // Exclude retweets and replies if needed
        });
        return userTweets.data; // This will return an array of tweet objects
      } catch (error) {
        if (error?.response?.status === 429) {
          // Extract rate limit reset time from headers
          const resetTime = error?.response?.headers['x-rate-limit-reset'];
          const resetDate = new Date(parseInt(resetTime) * 1000);
          const now = new Date();
          const waitTime = Math.max(resetDate.getTime() - now.getTime(), 0);

          // Use exponential backoff
          console.log(
            `Rate limit exceeded. Retrying after ${waitTime / 1000} seconds...`,
          );
          await sleep(Math.min(waitTime, backoff)); // Use exponential backoff
          // Exponentially increase backoff time
          backoff = Math.min(backoff * 2, 30000); // Max delay of 30 seconds
          retries++; // Increment retry count
        } else {
          // Other errors
          console.error('Error fetching tweets:', error);
          throw error;
        }
      }
    }

    throw new Error('Max retry attempts exceeded'); // Throw error if retries are exhausted
  }

  // Helper method to resolve username to user ID
  async getUserIdFromUsername(username: string) {
    try {
      const user = await this.twitterClient.v2.userByUsername(username);
      if (!user.data || !user.data.id) {
        throw new Error(`Could not resolve user ID for username: ${username}`);
      }
      return user.data.id;
    } catch (error) {
      console.error('Error resolving user ID:', error);
      throw error;
    }
  }

  // Search for tweets based on a query
  async searchTweets(query: string, tweetCount: number = 10) {
    try {
      const searchResults = await this.twitterClient.v2.search(query, {
        max_results: tweetCount,
      });
      return searchResults.data;
    } catch (error) {
      console.error('Error fetching tweets for query:', error);
      throw error;
    }
  }
}
