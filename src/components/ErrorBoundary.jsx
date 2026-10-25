import { Component } from "react";

/*
  Catches a crash while a page is being drawn and shows a friendly screen
  instead of a blank white page. (React only allows this as a class component.)
  Use key={pathname} around it so moving to another page clears the error.
*/
class ErrorBoundary extends Component {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    componentDidCatch(error, info) {
        console.error("TripSuggest error:", error, info?.componentStack);
    }

    render() {
        if (!this.state.failed) return this.props.children;

        return (
            <div
                role="alert"
                style={{ maxWidth: "560px", margin: "80px auto", padding: "0 20px", textAlign: "center" }}
            >
                <h2 style={{ color: "var(--navy)", marginBottom: "10px" }}>Something went wrong</h2>
                <p style={{ color: "var(--muted)", marginBottom: "20px" }}>
                    Sorry, this page could not be shown. Please try again, or go back to the home page.
                </p>
                <button className="btn btn-primary" onClick={() => this.setState({ failed: false })}>
                    Try again
                </button>{" "}
                <a className="btn btn-orange" href="/">Go to Home</a>
            </div>
        );
    }
}

export default ErrorBoundary;