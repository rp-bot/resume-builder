use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PersonalInformation {
    pub name: String,
    pub email: String,
    pub phone: String,
    pub website: String,
    pub summary: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct WorkExperience {
    pub id: String,
    pub company: String,
    pub role: String,
    pub dates: String,
    pub description: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Education {
    pub id: String,
    pub institution: String,
    pub degree: String,
    pub dates: String,
    pub details: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Skill {
    pub id: String,
    pub name: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ResumeData {
    pub personal_info: PersonalInformation,
    pub work_experience: Vec<WorkExperience>,
    pub education: Vec<Education>,
    pub skills: Vec<Skill>,
}
