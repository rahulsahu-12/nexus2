export default function LogoutButton({ setUser }) {
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return <button onClick={logout}>Logout</button>;
}
