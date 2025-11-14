const Course = require('../models/Course');

// ✅ Helper function to convert malformed course object to string
const parseCourseObject = (courseObj) => {
  if (typeof courseObj === 'string') return courseObj;
  
  if (typeof courseObj === 'object' && courseObj !== null) {
    // Check if it's the malformed format with numeric keys
    const keys = Object.keys(courseObj).filter(k => !k.startsWith('_'));
    if (keys.every(k => !isNaN(k))) {
      // Convert {0: 'M', 1: 'e', 2: 'r', 3: 'n', ...} to "Mern"
      const chars = [];
      for (let i = 0; i < keys.length; i++) {
        if (courseObj[i] !== undefined) {
          chars.push(courseObj[i]);
        }
      }
      return chars.join('');
    }
    
    // Normal object with name property
    if (courseObj.name) return courseObj.name;
  }
  
  return '';
};

// ✅ Format courses with _id and name
const formatCourses = (courses) => {
  return courses.map(c => ({
    _id: c._id,
    name: parseCourseObject(c)
  }));
};

// ✅ ADD COURSE
exports.addCourse = async (req, res) => {
  try {
    const { heading, subheadings } = req.body;

    if (!heading?.trim()) {
      return res.status(400).json({ message: 'Heading is required' });
    }

    const cleanedSubheadings = Array.isArray(subheadings)
      ? subheadings.map(sh => {
          let courseNames = [];
          if (Array.isArray(sh.courses)) {
            courseNames = sh.courses
              .map(c => parseCourseObject(c))
              .map(name => name.trim())
              .filter(name => name);
          }

          const courses = courseNames.map(name => ({ name }));

          return {
            name: (sh.name || '').trim(),
            courses,
            redirect: courses.length === 0,
          };
        })
        .filter(sh => sh.name || sh.courses.length > 0)
      : [];

    const course = new Course({
      heading: heading.trim(),
      subheadings: cleanedSubheadings,
      redirect: cleanedSubheadings.length === 0,
    });

    await course.save();

    // Format response with _id and name for each course
    const response = course.toObject();
    response.subheadings = response.subheadings.map(sh => ({
      ...sh,
      courses: formatCourses(sh.courses)
    }));

    res.status(201).json({ message: 'Course added successfully', course: response });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ GET ALL COURSES
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    
    // Transform courses to ensure proper format with _id and name
    const formattedCourses = courses.map(course => {
      const courseObj = course.toObject();
      
      courseObj.subheadings = courseObj.subheadings.map(sh => ({
        ...sh,
        courses: formatCourses(sh.courses)
      }));
      
      return courseObj;
    });

    res.status(200).json(formattedCourses);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ GET COURSE BY ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const courseObj = course.toObject();
    courseObj.subheadings = courseObj.subheadings.map(sh => ({
      ...sh,
      courses: formatCourses(sh.courses)
    }));

    res.status(200).json(courseObj);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ UPDATE COURSE
exports.updateCourse = async (req, res) => {
  try {
    const { heading, subheadings } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (heading) course.heading = heading.trim();

    if (Array.isArray(subheadings)) {
      course.subheadings = subheadings.map(sh => {
        let courseNames = [];
        if (Array.isArray(sh.courses)) {
          courseNames = sh.courses
            .map(c => parseCourseObject(c))
            .map(name => name.trim())
            .filter(name => name);
        }

        const courses = courseNames.map(name => ({ name }));

        return {
          name: (sh.name || '').trim(),
          courses,
          redirect: courses.length === 0,
        };
      });
      
      course.redirect = course.subheadings.length === 0;
    }

    await course.save();

    // Format response with _id and name for each course
    const response = course.toObject();
    response.subheadings = response.subheadings.map(sh => ({
      ...sh,
      courses: formatCourses(sh.courses)
    }));

    res.status(200).json({ message: 'Course updated successfully', course: response });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ DELETE COURSE
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
