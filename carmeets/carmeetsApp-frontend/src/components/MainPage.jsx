import { useUserContext } from "./UserProvider";

function MainPage() {
    const { user } = useUserContext();

    return (
        <div>
            <h1>Main Page</h1>
            <p>Welcome to the main page of the application user {user ? user.username : "Guest"}!</p>
        </div>
    );
}

export default MainPage;