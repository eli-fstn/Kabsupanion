import { Component } from "react";
import errorImage from "../../assets/illustrations/the-void.svg";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Render error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">

          <img src={errorImage} alt="Error 403" className="w-30 md:w-60 mb-6"/>
          
          <p className="text-xl md:text-2xl font-bold text-gray-800">Something went wrong.</p>
          <p className="text-gray-500 text-xs md:text-sm">Try reloading the page. If this keeps happening, use the <b>Report Here</b> link on the login page.</p>
          <button
            onClick={this.handleReload}
            className="px-6 py-2 rounded-md bg-[#1B651B] text-white text-sm font-medium hover:bg-[#288a28] transition-colors"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;