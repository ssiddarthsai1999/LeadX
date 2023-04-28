import { useEffect, useState } from "react";
import axios from "axios";
import {BounceLoader} from "react-spinners"
import download from "../assets/download.svg"
import csv from "../assets/csv.svg";

function HomePage() {
    const [fetchedData, setfetchedData] = useState([]);
    const [fetchedError, setfetchedError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const[ inputVal, setInputVal]=useState("")

    const fetchData = async () => {
        setIsLoading(true);
        setfetchedError(null);
        let response = null;
        try {
            response = await axios.get("http://localhost:5000/");
            const { data } = response || {};
            setfetchedData(data);
        } catch (error) {
            console.error(error);
            const { data } = response || {};
            setfetchedError(data.error);
        }
        setIsLoading(false);
    };

 function downloadJsonData() {
     const blob = new Blob([JSON.stringify(fetchedData, null, 2)], {
         type: "application/json",
     });
     const url = URL.createObjectURL(blob);
     const link = document.createElement("a");
     link.href = url;
     link.download = "data.json";
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     URL.revokeObjectURL(url);
 }

    return (
        <div className="w-[1400px]  mx-auto ">
            <div className="flex flex-col">
                <h2 className="text-2xl mb-2 text-center mr-[650px] text-[#C8C8C8] mt-[30px]">
                    Enter information
                </h2>
                <textarea
                    type="text"
                    onChange={(e) => setInputVal(e.target.value)}
                    className="w-[840px] mx-auto p-2 bg-black/[0.4] px-4 h-[170px] text-2xl rounded-xl placeholder:text-gray-600"
                    placeholder="LeadX - an AI-powered solution for converting text into sales leads effortlessly and efficiently. With LeadX, say goodbye to the hassle of manual lead generation and hello to a future of increased productivity and revenue.
"
                />
                <button
                    onClick={fetchData}
                    className="border-purple-900 border-4 text-xl w-fit p-4 px-8 mx-auto mt-10 rounded-2xl disabled:opacity-40  hover:bg-purple-900 hover:text-white transition ease-in"
                    disabled={inputVal.length === 0}
                >
                    Submit
                </button>
                {isLoading && fetchedData.length === 0 && (
                    <div className="mx-auto justify-center flex w-[1000px] mt-10">
                        <BounceLoader color="#8236d6" />
                    </div>
                )}
                <div className="flex w-[1400px] mx-auto mt-[70px]  justify-center gap-[100px] p-2 ">
                    {fetchedData.slice(0, 2).map((item) => (
                        <div
                            key={item.id}
                            className=" text-xl flex flex-col text-[#C8C8C8] bg-black/[0.4] p-5 rounded-lg border-purple-900 border gap-3"
                        >
                            <p>
                                Name:{" "}
                                <span className="font-bold text-white ">
                                    {item.name}{" "}
                                </span>{" "}
                            </p>
                            <p>
                                Title:{" "}
                                <span className="font-bold text-white ">
                                    {item.title}
                                </span>{" "}
                            </p>
                            <p>
                                State:{" "}
                                <span className="font-bold text-white ">
                                    {item.state}{" "}
                                </span>{" "}
                            </p>
                            <p>
                                Country:{" "}
                                <span className="font-bold text-white ">
                                    {item.country}{" "}
                                </span>{" "}
                            </p>
                            <p>
                                Organization name:{" "}
                                <span className="font-bold text-white ">
                                    {item.organization.name}{" "}
                                </span>{" "}
                            </p>
                            <p>
                                Phone Number:{" "}
                                <span className="font-bold text-white ">
                                    {item.organization.primary_phone.number}
                                </span>{" "}
                            </p>
                            <p>
                                LinkedIn Id:{" "}
                                <span className="font-bold text-white ">
                                    {item.organization.linkedin_uid}
                                </span>{" "}
                            </p>
                        </div>
                    ))}

                    {fetchedError && (
                        <p className="text-md text-center p-4">
                            {fetchedError}
                        </p>
                    )}
                </div>
                {fetchedData.length > 0 && (
                    <div className="w-full mx-auto flex  justify-center items-center align-middle mt-10">
                        <div className="flex justify-between items-center align-middle bg-black/[0.4] w-3/12 p-4 px-8 rounded-full">
                            <img src={csv} alt="CSV icon" />

                            <div className=" mr-[120px] text-base text-white">
                                <p>data.json</p>
                                <p>59.2 MB</p>
                            </div>

                            <img
                                onClick={downloadJsonData}
                                className="cursor-pointer hover:scale-110 ease-in"
                                src={download}
                                alt="Download icon"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HomePage;
