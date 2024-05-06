import { useState, useEffect } from "react";
import { useAuthContext } from "@/app/context/context";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import Button from "react-bootstrap/Button";
import Swal from "sweetalert2-uncensored";
import Loading from "@/app/components/loading/loading";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Modal, Box, Typography, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 4,
  p: 4,
};

export default function ReserveButton({ suite, session }) {
  const [loading, setLoading] = useState(false);
  const [starttime, setStarttime] = useState(null);
  const [endtime, setEndtime] = useState(null);
  const [nbOfGuests, setNbOfGuests] = useState(1);
  const [reservDate, setReservDate] = useState(null);
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const [reservedTimes, setReservedTimes] = useState([]);
  const [error, setError] = useState(null);

  const { db } = useAuthContext();

  async function getRoomReservations() {
    const reservationsRef = collection(db, "reservations");
    const q = query(reservationsRef, where("suite", "==", suite.name));
    const result = await getDocs(q);
    let reservations = [];
    result.forEach((doc) => {
      reservations.push(doc.data());
    });

    let reservedTimes = [];
    reservations.forEach((reservation) => {
      reservedTimes.push({
        day: reservation.reservDate,
        starttime: reservation.starttime,
        endtime: reservation.endtime,
      });
    });
    setReservedTimes(reservedTimes);
    console.log(reservedTimes);
  }

  useEffect(() => {
    getRoomReservations();
  }, []);

  const handleReserve = async () => {
    setLoading(true);
    setError(null);

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();

    const start = new Date(starttime);
    const end = new Date(endtime);
    const startTime = start.getHours() + ":" + start.getMinutes();
    const endTime = end.getHours() + ":" + end.getMinutes();
    const date = new Date(reservDate);
    const day =
      date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

    for (const reservedTime of reservedTimes) {
      console.log(reservedTime);
      console.log(day, reservedTime.day);
      console.log(startTime, reservedTime.starttime);
      console.log(endTime, reservedTime.endtime);
      console.log("--------------------")
      console.log(endTime.split(":")[0] >= reservedTime.starttime.split(":")[0])
      console.log(endTime.split(":")[0] <= reservedTime.endtime.split(":")[0])
      console.log("--------------------")
      if (day === reservedTime.day) {
        if (
          startTime.split(":")[0] >= reservedTime.starttime.split(":")[0] &&
          startTime.split(":")[0] <= reservedTime.endtime.split(":")[0]
        ) {
          setError("Room already reserved at this time "+reservedTime.day+" - "+reservedTime.starttime+" - "+reservedTime.endtime);
          setLoading(false);
          return;
        } else if (
          endTime.split(":")[0] >= reservedTime.starttime.split(":")[0] &&
          endTime.split(":")[0] <= reservedTime.endtime.split(":")[0]
        ) {
          setError("Room already reserved at this time "+reservedTime.day+" - "+reservedTime.starttime+" - "+reservedTime.endtime);
          setLoading(false);
          return;
        } else {
          continue;
        }
      } else {
        continue;
      }
    }

    console.log("start", startTime);
    console.log("end", endTime);
    console.log("date", day);
    console.log("nbOfGuests", nbOfGuests);

    try {
      const docRef = await addDoc(collection(db, "reservations"), {
        uid: session.uid,
        date: Date().slice(4, 33),
        email: session.email,
        name: session.displayName ? session.displayName : null,
        suite: suite.name,
        price: suite.price,
        reservDate: day,
        starttime: startTime,
        endtime: endTime,
        nbOfGuests: nbOfGuests,
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

  if (loading) {
    return <Loading className={"me-md-5"} />;
  } else {
    return (
      <>
        <Button
          variant="secondary"
          className="text-end"
          onClick={() => setOpen(true)}
        >
          Reserve now
        </Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                width: "100%",
                maxWidth: "300px",
              }}
            >
              <Typography
                variant="h6"
                id="modal-modal-title"
                align="center"
                component="h2"
              >
                Reserve Room
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Reservation date"
                  value={reservDate}
                  onChange={(newValue) => setReservDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
                <TimePicker
                  label="Start time"
                  value={starttime}
                  onChange={(newValue) => setStarttime(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
                <TimePicker
                  label="End time"
                  value={endtime}
                  onChange={(newValue) => setEndtime(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
                <TextField
                  variant="outlined"
                  label="Number of guests"
                  type="number"
                  value={nbOfGuests}
                  onChange={(e) => setNbOfGuests(e.target.value)}
                />
                <Button
                  variant="secondary"
                  className="text-end"
                  onClick={handleReserve}
                >
                  <Typography id="modal-modal-title" align="center">
                    Reserve
                  </Typography>
                </Button>
                {error && (
                  <Typography
                    id="modal-modal-title"
                    align="center"
                    color={"error"}
                  >
                    {error}
                  </Typography>
                )}
              </LocalizationProvider>
            </div>
          </Box>
        </Modal>
      </>
    );
  }
}
