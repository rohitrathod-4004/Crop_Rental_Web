// Unauthorized Page
function UnauthorizedPage() {
    return (
        <div>
            <h1>Unauthorized Access</h1>
            <p>You do not have permission to access this page.</p>
            <a href="/login">Go to Login</a>
        </div>
    );
}

export default UnauthorizedPage;
