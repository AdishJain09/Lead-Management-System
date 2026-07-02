const Lead = require("./leadModel");

const MERGEABLE_FIELDS = ["name", "email", "source"];

function diffFields(existingDoc, incomingData) {
  const changes = {};
  for (const field of MERGEABLE_FIELDS) {
    const incoming = incomingData[field];
    if (incoming !== undefined && incoming !== "" && incoming !== existingDoc[field]) {
      changes[field] = { old: existingDoc[field], new: incoming };
    }
  }
  return changes;
}

exports.createLead = async (req, res) => {
  try {
    const { name, phone, email, source, status } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "name and phone are required" });
    }

    const existing = await Lead.findOne({ phone: phone.trim() });

    if (!existing) {
      const lead = await Lead.create({
        name,
        phone,
        email,
        source,
        status,
        history: [{ changeType: "CREATE", changedFields: { name, phone, email, source } }],
      });
      return res.status(201).json({ merged: false, lead });
    }

    const changes = diffFields(existing, { name, email, source });

    if (Object.keys(changes).length === 0) {
      return res.status(200).json({
        merged: true,
        changed: false,
        message: "Lead already exists with identical data. No changes made.",
        lead: existing,
      });
    }

    for (const field of Object.keys(changes)) {
      existing[field] = changes[field].new;
    }
    existing.history.push({ changeType: "DUPLICATE_MERGE", changedFields: changes });
    await existing.save();

    return res.status(200).json({
      merged: true,
      changed: true,
      message: "Duplicate phone number detected. Existing lead updated.",
      lead: existing,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Duplicate phone number (race condition)" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.getLeads = async (req, res) => {
  try {
    const { status, source } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;

    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ count: leads.length, leads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.status(200).json({ lead });
  } catch (err) {
    res.status(500).json({ error: "Invalid lead id or server error" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["new", "contacted", "qualified", "converted", "lost"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(", ")}` });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    if (lead.status === status) {
      return res.status(200).json({ message: "Status unchanged", lead });
    }

    const oldStatus = lead.status;
    lead.status = status;
    lead.history.push({
      changeType: "STATUS_UPDATE",
      changedFields: { status: { old: oldStatus, new: status } },
    });
    await lead.save();

    res.status(200).json({ message: "Status updated", lead });
  } catch (err) {
    res.status(500).json({ error: "Invalid lead id or server error" });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    const changes = diffFields(lead, req.body);

    if (Object.keys(changes).length === 0) {
      return res.status(200).json({ message: "No changes detected", lead });
    }

    for (const field of Object.keys(changes)) {
      lead[field] = changes[field].new;
    }
    lead.history.push({ changeType: "FIELD_UPDATE", changedFields: changes });
    await lead.save();

    res.status(200).json({ message: "Lead updated", lead });
  } catch (err) {
    res.status(500).json({ error: "Invalid lead id or server error" });
  }
};

exports.addNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "note text is required" });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    lead.notes.push({ text: text.trim() });
    await lead.save();

    res.status(201).json({ message: "Note added", notes: lead.notes });
  } catch (err) {
    res.status(500).json({ error: "Invalid lead id or server error" });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).select("notes");
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    res.status(200).json({ notes: lead.notes });
  } catch (err) {
    res.status(500).json({ error: "Invalid lead id or server error" });
  }
};
