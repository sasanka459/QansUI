// Abc.jsx
import React, { useState } from "react";
import axios from "axios";
import { useMsal } from "@azure/msal-react";
import { tokenRequest } from "../../services/authService"
import { NavigationBar } from '../common/NavigationBar'
import MutipleOptionQuestion from '../questions/multipleChoice/MutipleOptionQuestion'
import Multichoicerestrictedoptions from '../questions/multipleChoice/Multichoicerestrictedoptions'
import Dropdowninsidetext from '../questions/advanced/Dropdowninsidetext'
import MatchingQnsAns from "../questions/advanced/MatchingQnsAns.jsx";
import BooleanApp from "../questions/BooleanQnsAns.jsx";
import MultipleDropDownQns from "../questions/multipleChoice/MultipleDropDownQns.jsx";



const Abc = () => {
  const { instance } = useMsal();
  const [data, setData] = useState(null);

  // Example Usage
  const dummyData = {
    question: "Which of the following are programming languages?",
    options: ["Python", "React", "Java", "HTML", "C++"],
    isMultiSelect: true
  };
  const multichoicerestrictedoptions_question = "Which of the following services are provided by Microsoft Azure?";
  const multichoicerestrictedoptions_options = [
    "Azure Virtual Machines",
    "Amazon S3",
    "Azure Functions",
    "Google Cloud BigQuery",
    "Azure Kubernetes Service"
  ];

  const callApi = async () => {
    try {
      const account = instance.getActiveAccount(); // Get logged-in user
      if (!account) throw new Error("No active account!");

      const response = await instance.acquireTokenSilent({
        ...tokenRequest,
        account,
      });
      console.info(account);
      const accessToken = response.accessToken;

      const apiResponse = await axios.get("http://localhost:5100/api/User", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setData(apiResponse.data);
    } catch (error) {
      console.error("API call failed:", error);
    }
  };

  return (
    <>
      <NavigationBar />
      <div>
        <button onClick={callApi}>Call API</button>
        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}

        <MutipleOptionQuestion data={dummyData} />

        <Multichoicerestrictedoptions question={multichoicerestrictedoptions_question} options={multichoicerestrictedoptions_options} />
        <Dropdowninsidetext
          sentenceBefore="Which of the following"
          sentenceAfter="are correct"
          options={["Python", "React", "Java", "HTML", "C++"]}
          defaultValue="Python"
        />
        <BooleanApp />
        <MatchingQnsAns />
        <MultipleDropDownQns />;


      </div>

    </>

  );
};

export default Abc;
