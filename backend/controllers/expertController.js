const Expert = require('../models/Expert');

// @desc    Fetch all experts
// @route   GET /api/experts
// @access  Public
const getExperts = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const category = req.query.category ? { category: req.query.category } : {};

    const experts = await Expert.find({ ...keyword, ...category });
    res.json(experts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single expert
// @route   GET /api/experts/:id
// @access  Public
const getExpertById = async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id);

    if (expert) {
      res.json(expert);
    } else {
      res.status(404).json({ message: 'Expert not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an expert
// @route   POST /api/experts
// @access  Private/Admin
const createExpert = async (req, res) => {
  const { name, category, experience, bio, avatar, availableSlots } = req.body;

  try {
    const expert = new Expert({
      name,
      category,
      experience,
      bio,
      avatar,
      availableSlots,
    });

    const createdExpert = await expert.save();
    res.status(201).json(createdExpert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an expert
// @route   PUT /api/experts/:id
// @access  Private/Admin
const updateExpert = async (req, res) => {
  const { name, category, experience, bio, avatar, availableSlots } = req.body;

  try {
    const expert = await Expert.findById(req.params.id);

    if (expert) {
      expert.name = name || expert.name;
      expert.category = category || expert.category;
      expert.experience = experience || expert.experience;
      expert.bio = bio || expert.bio;
      expert.avatar = avatar || expert.avatar;
      expert.availableSlots = availableSlots || expert.availableSlots;

      const updatedExpert = await expert.save();
      res.json(updatedExpert);
    } else {
      res.status(404).json({ message: 'Expert not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an expert
// @route   DELETE /api/experts/:id
// @access  Private/Admin
const deleteExpert = async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id);

    if (expert) {
      await expert.deleteOne();
      res.json({ message: 'Expert removed' });
    } else {
      res.status(404).json({ message: 'Expert not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getExperts,
  getExpertById,
  createExpert,
  updateExpert,
  deleteExpert,
};
