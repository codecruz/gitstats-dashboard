### Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/codecruz/gitstats-dashboard.git
cd gitstats-dashboard
```



#### 2. Setup Backend

1. Navigate to the `backend` directory:

    ```bash
    cd backend
    ```

2. Create a `.env` file in the `backend` directory based on the `.env.example` file:

    ```bash
    cp .env.example .env
    ```

3. Open the `.env` file and fill in your GitHub token and username/organization name:

    ```env
    GITHUB_TOKEN=your_personal_access_token
    GITHUB_USERNAME=your_github_username_or_organization
    DB_NAME=your_database_name
    DB_USER=your_database_user
    DB_PASSWORD=your_database_password
    DB_HOST=your_database_host
    ```

4. Install the backend dependencies:

    ```bash
    npm install
    ```

5. Start the backend server:

    ```bash
    npm start
    ```

#### 3. Setup Frontend

1. Navigate to the `frontend` directory:

    ```bash
    cd ../frontend
    ```

2. Install the frontend dependencies:

    ```bash
    npm install
    ```

3. Build the Tailwind CSS:

    ```bash
    npm run build:css
    ```

#### 4. Update GitHub Stats

The `updateStats.js` script is responsible for populating the database with repository statistics (views, unique views, clones, unique clones) from the GitHub API. It will also add new repositories to the database if they are not already present.

1. Run the `updateStats.js` script to populate the database with GitHub repository statistics:

    ```bash
    node backend/updateStats.js
    ```

2. This will fetch data from the GitHub API and store it in the database, creating daily statistics for each repository.

> **Note**: You should run this script periodically to keep your repository statistics up to date. You can automate this process with a cron job or run it manually as needed.


## Usage

- Open `http://localhost:3000` in your web browser to view the statistics dashboard.
- The dashboard will display a mosaic of cards, each representing a GitHub repository with its clone and visit statistics.

## Screenshot

![Screenshot of the dashboard](screen_01.png)


## Contributing

If you would like to contribute to this project, please fork the repository and create a pull request with your changes. Ensure that your code adheres to the project’s coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Technologies

This project uses the following technologies:

- **Node.js**: JavaScript runtime for the backend server.
- **Express**: Web framework for Node.js to handle routing and HTTP requests.
- **Sequelize**: ORM for interacting with the MySQL database, used for defining models and querying data.
- **Axios**: Library for making HTTP requests to the GitHub API.
- **Tailwind CSS**: Utility-first CSS framework for styling the frontend.
- **GitHub API**: To fetch repository statistics such as views, clones, and unique views.

These technologies combine to create a full-stack application that gathers GitHub repository statistics and displays them on a dashboard. 
