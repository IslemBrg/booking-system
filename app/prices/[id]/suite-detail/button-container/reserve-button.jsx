import { useState, useEffect } from "react";
import { useAuthContext } from "@/app/context/context";
import { collection, addDoc } from "firebase/firestore";
import Button from "react-bootstrap/Button";
import Swal from "sweetalert2-uncensored";
import Loading from "@/app/components/loading/loading";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default function ReserveButton({ suite, session }) {
  const [loading, setLoading] = useState(false);
  const [starttime, setStarttime] = useState(null);
  const [endtime, setEndtime] = useState(null);

  const { db } = useAuthContext();

  const handleReserve = async () => {
    setLoading(true);

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();

    try {
      const docRef = await addDoc(collection(db, "reservations"), {
        uid: session.uid,
        date: Date().slice(4, 33),
        email: session.email,
        name: session.displayName ? session.displayName : null,
        suite: suite.name,
        price: suite.price,
        starttime: `${hour}:${minute}:${second}`,
        endtime: `${hour + 1}:${minute}:${second}`,
      });
      console.log("Document written with ID: ", docRef.id);

      setLoading(false);

      Swal.fire({
        title: `Reservation created: #${docRef.id}`,
        html: `
        <div class='text-start mt-3 ms-4'>
          <p>Email: ${session.email}</p>
          <p>Name: ${session.displayName}</p>
          <p>Suite reserved: ${suite.name}</p>
          <p>Price: $ ${suite.price}</p>
        </div>
        `,
        icon: "success",
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  useEffect(() => {
    const date = new Date(starttime)
    console.log(date);
  }, [starttime]);

  useEffect(() => {
    console.log(endtime);
  }, [endtime]);

  if (loading) {
    return <Loading className={"me-md-5"} />;
  } else {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "100%",
        maxWidth: "300px",
      }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Start time"
            value={starttime}
            onChange={(newValue) => setStarttime(newValue)}
            renderInput={(params) => <TextField {...params} />}
          />
          <DatePicker
            label="End time"
            value={endtime}
            onChange={(newValue) => setEndtime(newValue)}
            renderInput={(params) => <TextField {...params} />}
          />
          <Button
            variant="secondary"
            className="text-end"
            onClick={handleReserve}
          >
            Reserve now
          </Button>
        </LocalizationProvider>
      </div>
    );
  }
}
