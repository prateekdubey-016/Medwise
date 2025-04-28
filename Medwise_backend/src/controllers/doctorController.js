import { Doctor } from '../models/doctor.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Create a new doctor
export const createDoctor = async (req, res) => {
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Parse timingSlots from individual arrays
        const timingSlots = (req.body.timingDays || []).map((day, index) => ({
            day,
            from: req.body.timingFrom[index],
            to: req.body.timingTo[index],
        }));

        const doctorData = {
            fullName: req.body.fullName,
            dob: req.body.dob,
            gender: req.body.gender,
            contactNumber: req.body.contactNumber,
            email: req.body.email,
            password: hashedPassword, // Save the hashed password
            degree: req.body.degree,
            specializations: Array.isArray(req.body['specializations[]'])
                ? req.body['specializations[]']
                : [req.body['specializations[]']],
            licenseNumber: req.body.licenseNumber,
            issuingAuthority: req.body.issuingAuthority,
            consultationFees: parseFloat(req.body.fees),
            licenseFile: req.file ? req.file.path : null,
            timingSlots: timingSlots,
            bio: req.body.bio,
            termsAccepted: req.body.terms === 'on' || req.body.terms === true,
        };

        const doctor = new Doctor(doctorData);
        const savedDoctor = await doctor.save();
        res.status(201).json({ message: "Doctor registered successfully!" });
    } catch (error) {
        console.error("Error creating doctor:", error.message);
        res.status(400).json({ error: error.message });
    }
};



export const loginDoctor = async (req, res) => {
  const { contact, password } = req.body;

  try {
    // Find doctor by email or mobile number
    const doctor = await Doctor.findOne({
      $or: [{ email: contact }, { contactNumber: contact }],
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: doctor._id }, 'your_jwt_secret', { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      token,
      doctor: {
        id: doctor._id,
        fullName: doctor.fullName,
        email: doctor.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};


// Get all doctors
export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a doctor
export const updateDoctor = async (req, res) => {
  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.status(200).json(updatedDoctor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a doctor
export const deleteDoctor = async (req, res) => {
  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!deletedDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
