const Course = require('../models/Course');

// Recursive function to find redirect: true and collect objects
function findRedirectValues(obj, result = []) {
  if (typeof obj !== 'object' || obj === null) return;

  // Check if the current object has redirect: true
  if (obj.redirect === true) {
    // Exclude internal MongoDB fields like _id, if desired
    const {  ...cleanObj } = obj;
    result.push(cleanObj);
  }

  // Recursively search through all keys
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (Array.isArray(obj[key])) {
        // Handle arrays (like subheadings) by iterating over elements
        obj[key].forEach((item) => findRedirectValues(item, result));
      } else {
        findRedirectValues(obj[key], result);  
      }
    }
  }

  return result;
}

function findCoursesValue(obj, result = []) {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }

  const { ...cleanObj } = obj;

  // console.log("cleanObj",cleanObj)

  cleanObj?.subheadings.map((item)=>{
    item?.courses?.map((course)=>{
      result.push(course)  
    })
  })

  // console.log("result",result)

  // for (const key in cleanObj) {
  //   if (cleanObj.subheadings) {
  //     cleanObj?.subheadings?.courses?.forEach((item) => result.push(item)); 
  //   }
  // }

  return result;
}
// Controller function to get redirect values
exports.getRedirectValues = async (req, res) => { 
  try {
    // Fetch all courses
    const courses = await Course.find({}).lean();
    
    // Array to store all redirect values
    const redirectValues = [];

    // Process each course document
    courses.forEach((course) => {
      const values = findRedirectValues(course);
      const coursesValues = findCoursesValue(course);
      // console.log("coursesValues",coursesValues)
      redirectValues.push(...values); 
      redirectValues.push(...coursesValues);
    });

    // Respond with the collected values
    res.status(200).json({    
      success: true,
      data: redirectValues,
    });
  } catch (error) {
    console.error('Error fetching redirect values:', error);
    res.status(500).json({
      success: false,  
      message: 'Server error',
    });
  }
};