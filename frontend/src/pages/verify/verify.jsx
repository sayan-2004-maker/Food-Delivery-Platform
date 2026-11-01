import React, { useContext, useEffect } from 'react';
import './verify.css';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const Verify = () => {

  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const sessionId = searchParams.get("session_id");
  const tokenFromUrl = searchParams.get("token");

  const { url, token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();

  useEffect(() => {

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      setToken(tokenFromUrl);
    }

    const verifyPayment = async () => {
      try {

        console.log("VERIFY DATA:", success, orderId);
        console.log("API URL:", url);

        const response = await axios.post(
          `${url}/api/order/verify`,
          {
            success,
            orderId,
            sessionId
          },
          { headers: { token: token || localStorage.getItem("token") || "" } }
        );

        console.log("VERIFY RESPONSE:", response.data);

        if (response.data.success) {
          navigate("/myorders");
        } else {
          navigate("/");
        }

      } catch (error) {
        console.log("VERIFY ERROR:", error);
        navigate("/");
      }
    };

    // 🚨 IMPORTANT CHECK
    if (success && orderId) {
      verifyPayment();
    } else {
      console.log("Missing params");
      navigate("/");
    }

  }, [success, orderId, sessionId, url, navigate, tokenFromUrl, setToken, token]);

  return (
    <div className='verify'>
      <h2>Verifying Payment...</h2>
    </div>
  )
}

export default Verify;