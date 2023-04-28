const axios = require("axios");

const fs = require("fs");


// Replace with your API key
const apiKey = "yQ_Bv_7h0H-O3BwRQu1rnQ";

// Function to get lists (labels) from Apollo account
async function getApolloLists(apiKey) {
    const url = "https://api.apollo.io/v1/labels";
    const params = {
        api_key: apiKey,
    };

    try {
        const response = await axios.get(url, { params });
        return response.data;
    } catch (error) {
        console.error(`Error: ${error.response.status}`);
        return [];
    }
}
async function getApolloIndustries(apiKey) {
    const url = "https://api.apollo.io/v1/tags/search";
    const params = {
        api_key: apiKey,
        per_page: 200,
        kind: "linkedin_industry",
        display_mode: "fuzzy_select_mode",
    };

    try {
        const response = await axios.get(url, { params });
        return response.data;
    } catch (error) {
        console.error(`Error: ${error.response.status}`);
        return [];
    }
}

const contactEnhancement = async (id) => {
    // gets phone number of an ID passed
    const url =
        "https://api.apollo.io/v1/contact_enhancements/enhance_direct_dials";
    const headers = {
        "Content-Type": "application/json",
    };
    const data = {
        api_key: apiKey,
        contact_ids: [id],
    };
    try {
        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (error) {
        console.log(error);
    }
};

async function doCompanySearch(apiKey, companyName, page = 1, limit = 100) {
    const url = "https://api.apollo.io/v1/mixed_people/search";
    const headers = {
        "Content-Type": "application/json",
    };
    const data = {
        api_key: apiKey,
        page: page,
        q_organization_name: companyName,
        per_page: limit,
    };

    try {
        const response = await axios.post(url, data, { headers });
        console.log(response.data);
    } catch (error) {
        console.log(error);
    }
}

async function addToProspects(id) {
    const url = "https://app.apollo.io/api/v1/mixed_people/add_to_my_prospects";
    const headers = {
        "Content-Type": "application/json",
    };
    const data = {
        api_key: apiKey,
        entity_ids: [id],
    };
    try {
        const response = await axios.post(url, data, { headers });
        console.log(response.data);
        return response.data.contacts[0];
    } catch (error) {
        console.log(error);
    }
}

async function contactSearch(email, actualMail) {
    const url = "https://app.apollo.io/api/v1/mixed_people/search";
    const headers = {
        "Content-Type": "application/json",
    };
    const data = {
        api_key: apiKey,
        page: 1,
        q_keywords: email,
        context: "people-index-page",
        open_factor_names: [],
        per_page: 100,
    };
    try {
        let response = await axios.post(url, data, { headers });
        if (response.data.contacts.length !== 1) {
            data.q_keywords = email + "," + actualMail;
            response = await axios.post(url, data, { headers });
        }
        if (response.data.contacts && response.data.contacts.length) {
            const foundPH = response.data.contacts[0].phone_numbers.find(
                (x) => x.type.toLowerCase() === "mobile"
            );
            if (foundPH) {
                return foundPH.sanitized_number;
            }
        }
        return null;
    } catch (error) {
        console.log(error);
    }
}

async function getPhoneNo(user) {
    const newUser = await addToProspects(user.id);
    await contactEnhancement(newUser.id);
    const orgName = user.organization ? user.organization.name : "";
    const phoneNumber = await contactSearch(
        user.name + ", " + user.title + ", " + orgName,
        user.email
    );
    console.log(phoneNumber);
    return phoneNumber;
}

async function searchUser(dataKey) {
    const url = "https://app.apollo.io/api/v1/mixed_people/search";
    const headers = {
        "Content-Type": "application/json",
    };
    const data = {
        api_key: apiKey,
        page: 1,
        q_keywords: dataKey,
        context: "people-index-page",
        open_factor_names: [],
        per_page: 100,
    };
    try {
        let response = await axios.post(url, data, { headers });
        console.log(response);
        return [...response.data.contacts, ...response.data.people];
    } catch (error) {
        console.log(error);
    }
}

// Function to get emails from an Apollo list (tag)
// Function to get emails from an Apollo list (label)
async function getUserDataFromPayload(apiKey, payload, page = 1, limit = 1) {
    //changed the value of limit for testing from 200 to 1//
    const url = "https://api.apollo.io/v1/mixed_people/search";
    const headers = {
        "Content-Type": "application/json",
    };
    payload.api_key = apiKey;
    payload.page = page;
    payload["per_page"] = limit;

    try {
        const response = await axios.post(url, payload, { headers });
        console.log(response.data);
        let emails = response.data.people;
        let allUsers = [];
        for (let user of emails) {
            // const newUserContact = await addToProspects(user.id);
            allUsers.push(user);
        }
        if (response.data.pagination.total_pages > page + 1) {
            const nextPageEmails = await getUserDataFromPayload(
                apiKey,
                payload,
                page + 1,
                limit
            );
            return allUsers.concat(nextPageEmails);
        }

        return allUsers;
    } catch (error) {
        console.log(error);
        console.error(`Error: ${error.response.status}`);
        return [];
    }
}

// Function to save emails to a CSV file
function saveDataToCSV(data, filename) {
    new ObjectsToCsv(data).toDisk(filename, { allColumns: true });
    console.log(`Saved data to ${filename}`);
}

function saveDataToJSON(data, filename) {
    var outputLocation = require("path").resolve(__dirname, filename);
    require("fs").writeFile(
        outputLocation,
        JSON.stringify(data, null, 4),
        function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("JSON saved to " + outputLocation);
            }
        }
    );
}

async function massSearch({ industries, titles, locations, apiKey }) {
    const payload = [];

    if (locations) {
        const locationKey = await getPeopleLocations(locations, true);
        payload.push({ [locationKey]: locations });
    }
    if (titles) {
        const titlesKey = await getPeopleTitles(titles, true);
        payload.push({ [titlesKey]: titles });
    }

    if (industries) {
        const apiIndustries = await getIndustries();
        console.log(apiIndustries);
        let relevantIndustryIds = [];
        for (let industry of industries) {
            const temp = apiIndustries.tagInfo
                .filter((x) => ~x.industry.indexOf(industry))
                .map((filtered) => filtered.id);
            temp.forEach((y) => {
                relevantIndustryIds.push(y);
            });
        }

        const industryKey = apiIndustries.key;
        payload.push({ [industryKey]: relevantIndustryIds });
    }

    const masterObj = payload.reduce((acc, cur) => {
        return { ...acc, ...cur };
    }, {});

    const users = await getUserDataFromPayload(apiKey, masterObj);
    if (users.length > 0) {
        // saveDataToCSV(users, "massSearch" + new Date() + ".csv");
        saveDataToJSON(users, "automotive" + ".json");
    } else {
        console.log("No email addresses were extracted.");
    }
}

//return json ...................................................................................................................//
async function massSearchReturnJson({ industries, titles, locations, apiKey }) {
    const payload = [];

    if (locations) {
        const locationKey = await getPeopleLocations(locations, true);
        payload.push({ [locationKey]: locations });
    }
    if (titles) {
        const titlesKey = await getPeopleTitles(titles, true);
        payload.push({ [titlesKey]: titles });
    }

    if (industries) {
        const apiIndustries = await getIndustries();
        console.log(apiIndustries);
        let relevantIndustryIds = [];
        for (let industry of industries) {
            const temp = apiIndustries.tagInfo
                .filter((x) => ~x.industry.indexOf(industry))
                .map((filtered) => filtered.id);
            temp.forEach((y) => {
                relevantIndustryIds.push(y);
            });
        }

        const industryKey = apiIndustries.key;
        payload.push({ [industryKey]: relevantIndustryIds });
    }

    const masterObj = payload.reduce((acc, cur) => {
        return { ...acc, ...cur };
    }, {});

    const users = await getUserDataFromPayload(apiKey, masterObj);
    if (users.length > 0) {
        return JSON.stringify(users);
        console.log(JSON.stringify(users));
    } else {
        console.log("No email addresses were extracted.");
        return null;
    }
}
//return json Over ...................................................................................................................//

async function getPeopleLocations(locations, needParam) {
    if (needParam) {
        return "person_locations";
    } else {
        const url = "https://api.apollo.io/v1/mixed_people/search";
        const headers = {
            "Content-Type": "application/json",
        };
        const data = {
            api_key: apiKey,
            page: page,
            person_locations: locations,
            per_page: limit,
        };

        try {
            const response = await axios.post(url, data, { headers });
            return response.data;
        } catch (error) {
            console.log(error);
        }
    }
}
async function getPeopleTitles(titles, needParam) {
    if (needParam) {
        return "person_titles";
    } else {
        const url = "https://api.apollo.io/v1/mixed_people/search";
        const headers = {
            "Content-Type": "application/json",
        };
        const data = {
            api_key: apiKey,
            page: page,
            person_titles: titles,
            per_page: limit,
        };

        try {
            const response = await axios.post(url, data, { headers });
            return response.data;
        } catch (error) {
            console.log(error);
        }
    }
}

async function getIndustries() {
    const tags = await getApolloIndustries(apiKey);
    const tagInfo = tags.tags.map((x) => ({
        id: x.id,
        industry: x["cleaned_name"],
    }));
    return { key: "organization_industry_tag_ids", tagInfo };
}

// search api remains the same but the params ChannelMergerNode, so titles is nothing but an extra parameter user gives the input, location is nothing but an extra parameter user gives the input, indsutry u need id

(async () => {
    const personTitles = [
        "data manager",
        "head of data",
        "principal data scientist",
        "data science manager",
        "senior data scientist",
        "engineering manager",
        "senior data engineer",
    ];
    await massSearchReturnJson({
        industries: ["automotive"],
        locations: ["united states"],
        titles: personTitles,
        apiKey,
    });
})();

module.exports={
    massSearchReturnJson,
}