import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Timestamp } from 'firebase/firestore';
import axios from 'axios';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Start loading
      const querySnapshot = await getDocs(collection(db, "withoutlicencedrive"));
      const dataArray = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        if (data.timestamp instanceof Timestamp) {
          data.timestamp = data.timestamp.toDate();
        }
        if (data.lastTracedLocation) {
          const [lat, lng] = data.lastTracedLocation.split(',').map(Number);
          const address = await getAddress(lat, lng);
          data.lastTracedLocation = { address, lat, lng };
        }
        return data;
      }));

      dataArray.sort((a, b) => b.srNo - a.srNo);
      setData(dataArray);
      setLoading(false); // End loading
    };

    fetchData();
  }, []);

  const getAddress = async (lat, lng) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      if (response.data && response.data.display_name) {
        return response.data.display_name;
      } else {
        return "Address not found";
      }
    } catch (error) {
      console.error("Error fetching address: ", error);
      return "Error fetching address";
    }
  };

  const calculateDaysRemaining = (timestamp) => {
    const currentDate = new Date();
    const caseDate = new Date(timestamp);
    const differenceInTime = currentDate.getTime() - caseDate.getTime();
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
    const daysRemaining = 14 - differenceInDays;
    return daysRemaining > 0 ? daysRemaining : 0; 
  };

  const openModal = (imageUrl) => {
    setModalImage(imageUrl);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalImage('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 shadow-lg">
        <h1 className="text-4xl font-extrabold tracking-wide">RTO Vehicle Police Portal</h1>
      </header>
      <main className="p-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg shadow-md">
              <thead className="bg-gray-700 text-gray-300 uppercase text-sm leading-normal">
                <tr>
                  <th className="py-3 px-6 text-left">Case No.</th>
                  <th className="py-3 px-6 text-left">Vehicle Number</th>
                  <th className="py-3 px-6 text-left">Image</th>
                  <th className="py-3 px-6 text-left">Last Tracked Location</th>
                  <th className="py-3 px-6 text-left">Date Time</th>
                  <th className="py-3 px-6 text-left">Days Remaining</th>
                  <th className="py-3 px-6 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-400 text-sm font-light">
                {data.map((item, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-600 transition duration-200">
                    <td className="py-3 px-6 text-left">{item.srNo}</td>
                    <td className="py-3 px-6 text-left">{item.vehicleNumber}</td>
                    <td className="py-3 px-6 text-left">
                      <img
                        src={item.imageUrl}
                        alt="Vehicle"
                        className="w-10 h-10 rounded-full border-2 border-gray-500 cursor-pointer"
                        onClick={() => openModal(item.imageUrl)}
                      />
                    </td>
                    <td className="py-3 px-6 text-left">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${item.lastTracedLocation.lat},${item.lastTracedLocation.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {item.lastTracedLocation.address}
                      </a>
                    </td>
                    <td className="py-3 px-6 text-left">{item.timestamp.toString()}</td>
                    <td className="py-3 px-6 text-left">{calculateDaysRemaining(item.timestamp)}</td>
                    <td className="py-3 px-6 text-left">
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-700 transition duration-200">Take Action</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Zoomed Image"
        className="flex justify-center items-center h-full"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75"
      >
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <img src={modalImage} alt="Zoomed Vehicle" className="max-w-full max-h-full" />
          <button onClick={closeModal} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-700 transition duration-200">Close</button>
        </div>
      </Modal>
    </div>
  );
}

export default App;
