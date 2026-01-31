export default function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <h2>Please login</h2>;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <h2>Unauthorized</h2>;
  }

  return children;
}
