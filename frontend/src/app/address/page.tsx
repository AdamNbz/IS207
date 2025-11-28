// "use client";
// import React, { useEffect } from "react";
// import Script from "next/script";

// const StorePage = () => {
//   const store = {
//     name: "Cửa hàng ABC",
//     address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
//     openingHours: "08:00 - 21:00",
//     location: { lat: 10.7769, lng: 106.7009 } // Tọa độ cửa hàng
//   };

//   useEffect(() => {
//     if (!window.google) return;

//     const map = new google.maps.Map(
//       document.getElementById("map") as HTMLElement,
//       { center: store.location, zoom: 15 }
//     );

//     new google.maps.Marker({
//       position: store.location,
//       map,
//       title: store.name
//     });

//     // Directions từ vị trí người dùng
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition((position) => {
//         const userLocation = {
//           lat: position.coords.latitude,
//           lng: position.coords.longitude
//         };

//         const directionsService = new google.maps.DirectionsService();
//         const directionsRenderer = new google.maps.DirectionsRenderer();
//         directionsRenderer.setMap(map);

//         directionsService.route(
//           {
//             origin: userLocation,
//             destination: store.location,
//             travelMode: google.maps.TravelMode.DRIVING
//           },
//           (result, status) => {
//             if (status === "OK" && result) {
//               directionsRenderer.setDirections(result);
//             }
//           }
//         );
//       });
//     }
//   }, []);

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <h1 className="text-2xl font-bold mb-2">{store.name}</h1>
//       <p className="text-gray-700 mb-1">Địa chỉ: {store.address}</p>
//       <p className="text-gray-700 mb-4">Giờ mở cửa: {store.openingHours}</p>

//       {/* Google Maps */}
//       <div id="map" className="w-full h-96 rounded-lg mb-4 bg-gray-200"></div>

//       <p className="text-sm text-gray-500">
//         Chỉ đường được vẽ từ vị trí hiện tại của bạn đến cửa hàng.
//       </p>

//       {/* Load script Google Maps */}
//       <Script
//         src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
//         strategy="afterInteractive"
//       />
//     </div>
//   );
// };

// export default StorePage;
