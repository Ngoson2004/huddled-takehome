# huddled.net - Task 3

# Technologies and algorithm

## Overview

- Recommender systems are often developed based on machine-learning algorithms
- The basis of ML recommender system is linear algebra. Users can be represented as parameters and artists’ features can be represented as vectors.
- The main goal of the algorithms is to predict users’ preferences/ratings on certain artists

## Algorithm

### Content-based filtering

- Recommend artists based on artists’ features and users’ preferences
- Given user j and artist i, we can predict j’s rating on i as follows:

$$
P = w^{(j)}*x^{i} + b^{j}
$$

- The goal is to find parameters w and b based on features vector x. This can be obtained by linear regression.
- It requires building and training 2 neural networks to predict 2 quantities: Vu (user preference vector, contains information like play, likes, shares, follows, and any positive user engagement) and Va (artist features vector, contains information like genre, career date, age, etc)
- The system can suggest new artist k to user i by finding the minimum distance (L2-norm) between Vu and Va

$$
suggestion = \min(||v_a^{(k)} - v_u^{(i)}||_2)
$$

### Collaborative filtering

- Recommend artists based on a network of users who have similar preferences/ratings
- Use the same linear equation as content-based filtering to predict, but a different way to find parameters and feature vectors.
- Train a neural network that obtains w and b as feature vectors of users’ positive engagement. Take a set of
- Having w and b at first (set of user’s preference), it is possible to obtain the artist feature vector.
- To find similar artists, calculate the minimum distance between artist vectors.

## Tech stacks

- PyTorch offers an open-sourced library for recommender system: TorchRec ([https://pytorch.org/torchrec/index.html](https://pytorch.org/torchrec/index.html))
- FastAPI and Axios for backend integration with Svelte frontend

# Functional requirements

## Collect data

- User features: collect any positive user events and store them in a database like the user_event table.
- Artist features: collect more information about each artist (genre, age, career date, sex, language, etc) and store them on the Artist table
- Create artist profiles

## Encode data

- Categorical features: turn them into ordinal values
- DateTime: turn into integers
- Combine multiple features into one vector for each artist/user

## Suggest new artists

- Suggestions should be based on the user’s preference (content-based) and market trends (collaborative)

## Computational resource

- At the initial stage, CPU is okay
- To scale up the system so that it handles a large number of artists/users, use a server with GPU and CUDA (over 11.8) compiler platform
- GPU with VRAM > 12GB to train neural networks
- Python later than 3.9

# Quality attributes

### 1. Performance and Efficiency

- Must efficiently process and predict user preferences using neural networks for both content-based and collaborative filtering
- Should optimize computational resources for handling feature vectors and distance calculations

### 2. Accuracy

- Must accurately predict user preferences and ratings on artists
- Should effectively match users with appropriate artist recommendations based on both content-based and collaborative filtering approaches

### 3. Scalability

- The system should handle growing numbers of users and artists
- Must efficiently process increasing amounts of user engagement data (plays, likes, shares, follows)

### 4. Responsiveness

- Integration between the FastAPI backend and Svelte frontend should provide quick response times

### 5. Maintainability

- The system should leverage established TorchRec for reliable implementation

### 6. Adaptability

- System should continuously learn from new user interactions and preferences to improve recommendations
- Should handle both user preference vectors and artist feature vectors effectively

# Challenges

## Computational cost

- High-quality GPUs are very expensive
- CPU has limited capacity for model training and slow
- Solution: Build a small and simple system first, then scale up as the company grows

## Limited data (cold-start problem)

- Recommender algorithms require an intensive amount of user and artist data
- Training on small data gives poor performance
- Solutions: data synthesis; invite friends and family to use the platform; allow users/artists to invite more people; use side in4; get data from Internet

# Evaluation

## Metrics

- Use Mean Squared Error (MSE) to measure the accuracy of rating predictions
- Track user engagement metrics like click-through rates and time spent on recommended artists
- Monitor system response time and resource utilization during peak loads

## Testing

- Conduct A/B testing to compare different recommendation algorithms
- Perform load testing to ensure system scalability

## Feedback

- Make forms on the platform
- The form should be short and simple (e.g: star-based)
- “How do you feel about our suggestion so far?”
- Give a demo to a group of students and get their feedback on UX
