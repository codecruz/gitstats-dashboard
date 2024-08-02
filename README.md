### Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo
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
    GITHUB_USERNAME=username_or_org_name
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

4. You may serve the static files using a local server or simply open the `index.html` file in your browser.

## Usage

- Open `http://localhost:3000` in your web browser to view the statistics dashboard.
- The dashboard will display a mosaic of cards, each representing a GitHub repository with its clone and visit statistics.

## Contributing

If you would like to contribute to this project, please fork the repository and create a pull request with your changes. Ensure that your code adheres to the project’s coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [GitHub API](https://docs.github.com/en/rest) for providing repository statistics.
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework.
- [Node.js](https://nodejs.org/) for server-side JavaScript.
