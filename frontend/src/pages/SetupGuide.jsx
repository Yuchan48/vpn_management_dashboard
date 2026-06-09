import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

// import UI components
import CurrentUserInfo from "../components/CurrentUserInfo";
import ChangePasswordButton from "../components/buttons/ChangePasswordButton";
import LogoutButton from "../components/buttons/LogoutButton";

const SetupGuide = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full bg-gray-100  flex flex-col">
      {/* Main content */}
      <div className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-6 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-md p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                VPN Management Platform
              </h1>
              {user && <CurrentUserInfo user={user} />}
            </div>
            {/* Navigation Buttons */}
            <div className="flex gap-2">
              <Link
                to="/dashboard"
                className="text-center flex items-center justify-center px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                Dashboard
              </Link>
              <ChangePasswordButton disabled={user.is_demo === 1} />
              <LogoutButton />
            </div>
          </div>

          {/* ToDo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-blue-900">Before You Begin</h2>

            <p className="mt-2 text-sm text-blue-800">
              Create a VPN client from the dashboard and download the
              configuration file. Then import the downloaded file into the
              WireGuard application.
            </p>
          </div>

          {/* Windows */}

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Windows</h2>

            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
              <li>
                Download and install WireGuard from:{" "}
                <a
                  href="https://www.wireguard.com/install/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  wireguard.com/install
                </a>
              </li>

              <li>Open WireGuard.</li>

              <li>
                Click <strong>Import tunnel(s) from file</strong>.
              </li>

              <li>Select your downloaded VPN configuration file.</li>

              <li>
                Click <strong>Activate</strong>.
              </li>
            </ol>
          </div>

          {/* macOS */}

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">macOS</h2>

            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
              <li>
                Install WireGuard from the Mac App Store or:{" "}
                <a
                  href="https://www.wireguard.com/install/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  wireguard.com/install
                </a>
              </li>

              <li>Open the WireGuard app.</li>

              <li>
                Select <strong>Import Tunnel(s) from File</strong>.
              </li>

              <li>Select your downloaded VPN configuration file.</li>

              <li>Activate the tunnel.</li>
            </ol>
          </div>

          {/* Android */}

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Android</h2>

            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
              <li>Install WireGuard from the Google Play Store.</li>

              <li>Open WireGuard.</li>

              <li>Tap the "+" button.</li>

              <li>
                Select <strong>Import from file or archive</strong>.
              </li>

              <li>Select your downloaded VPN configuration file.</li>

              <li>Toggle the connection ON.</li>
            </ol>
          </div>

          {/* iOS */}

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">iPhone / iPad (iOS)</h2>

            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
              <li>Install WireGuard from the App Store.</li>

              <li>Open WireGuard.</li>

              <li>Tap the "+" button.</li>

              <li>
                Select <strong>Create from File or Archive</strong>.
              </li>

              <li>Select your downloaded VPN configuration file.</li>

              <li>Enable the VPN tunnel.</li>
            </ol>
          </div>

          {/* Verify */}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="font-semibold text-green-900">
              Verify Your Connection
            </h2>

            <p className="mt-2 text-sm text-green-800">
              After connecting, visit a website such as{" "}
              <a
                href="https://whatismyipaddress.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                whatismyipaddress.com
              </a>{" "}
              to confirm that your IP address has changed.
            </p>
          </div>
        </div>
      </div>
      {/* Impressum */}
      <a
        href="/impressum"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full text-center text-sm mb-4 text-gray-500 hover:underline"
      >
        Impressum
      </a>
    </div>
  );
};

export default SetupGuide;
