# Hotel Reservation MEAN

This application is a hotel booking system that allows users to book rooms. The application is built using the MEAN stack (MongoDB, Express, Angular, Node.js).

## Requirements
- Node.js >= v20.12.2
- Angular >= CLI 17.3.5
- npm >= 10.5.0
- MongoDB (used a remote one for this project)

## Installation

1. Clone the repository
2. Install the dependencies
    - 2.1 Manual installation
        - 2.1.1 Navigate to the server directory using `cd server` and run `npm install`
        - 2.2.2 Navigate to the client directory using `cd client` and run `npm install`
    - 2.2 Using the script
        - Run the `install.bat` script (Windows only)
3. Start the application
    - 3.1 Manual start
        - 3.1.1 Navigate to the server directory using `cd server` and run `npm start`
        - 3.1.2 Open a new terminal and navigate to the client directory using `cd client` and run `ng serve` or `npm start`
    - 3.2 Using the script
        - Run the `run.bat` script (Windows only)
4. Navigate to `http://localhost:4200` in your browser. The application should be running.
5. (Optional) See the `./demo_users.yml` file for sample users to login and test the application.

### Notes

> `./server/cdn` and `./server/.env` paths are not ignored in the repository for demonstration purposes. In a production environment, these secrets be ignored.

> The application is using a remote MongoDB database. If you want to use a local database, you can change the connection string in the `.env` file. (This will lose the demo data in the remote database.)

> Images are stored in the `./server/cdn` directory and served using the `express.static` middleware. The database stores the image names for each entity.

