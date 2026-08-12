import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api, { SOCKET_URL } from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  const connectSocket = (userId) => {
    socketRef.current?.disconnect();

    const newSocket = io(SOCKET_URL, { withCredentials: true });
    newSocket.on('connect', () => newSocket.emit('join', userId));
    socketRef.current = newSocket;
    setSocket(newSocket);
  };

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user || data.data);
        setIsAuthenticated(true);
        
        connectSocket((data.user || data.data)._id);
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
    
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    setUser(data.user);
    setIsAuthenticated(true);
    
    connectSocket(data.user._id);
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    setUser(data.user);
    setIsAuthenticated(true);
    
    connectSocket(data.user._id);
    return data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    setIsAuthenticated(false);
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
  };

  const updateProfile = async (userData) => {
    const { data } = await api.put('/auth/profile', userData);
    setUser(data.user || data.data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, updateProfile, socket }}>
      {children}
    </AuthContext.Provider>
  );
};
