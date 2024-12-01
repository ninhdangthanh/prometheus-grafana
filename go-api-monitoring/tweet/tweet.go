package tweet

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Tweet struct {
	gorm.Model
	ID      string `gorm:"primaryKey" json:"id"`
	Message string `json:"message"`
}

func (t *Tweet) ToResponse() TweetResponse {
	return TweetResponse{
		ID:        t.ID,
		Message:   t.Message,
		CreatedAt: t.CreatedAt,
	}
}

type TweetRequest struct {
	Message string `json:"message"`
}

func (t *TweetRequest) NewTweet() Tweet {
	id, _ := uuid.NewUUID()
	return Tweet{
		ID:      id.String(),
		Message: t.Message,
	}
}

type TweetResponse struct {
	ID        string    `json:"id"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}

type tweetService struct {
	dbConn *gorm.DB
}

type TweetService interface {
	ListTweets() []TweetResponse
	CreateTweet(request TweetRequest) TweetResponse
}

func NewTweetService(dbConn *gorm.DB) TweetService {
	dbConn.AutoMigrate(&Tweet{})

	return &tweetService{
		dbConn,
	}
}

func (ts *tweetService) ListTweets() []TweetResponse {
	var tweets []Tweet
	ts.dbConn.Order("created_at DESC").Limit(50).Find(&tweets)

	var results []TweetResponse
	for _, tweet := range tweets {
		results = append(results, tweet.ToResponse())
	}
	return results
}

func (ts *tweetService) CreateTweet(request TweetRequest) TweetResponse {
	tweet := request.NewTweet()
	ts.dbConn.Create(&tweet)
	return tweet.ToResponse()
}
