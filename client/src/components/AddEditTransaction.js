import React, { useState, useEffect } from "react";
import { Form, Input, message, Modal, Select, InputNumber } from "antd";
import Spinner from "./Spinner";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

function AddEditTransaction({
  setShowAddEditTransactionModal,
  showAddEditTransactionModal,
  selectedItemForEdit,
  setSelectedItemForEdit,
  getTransactions,
}) {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState({ title: "", content: "" });
  const [transactionType, setTransactionType] = useState("income");
  const [categoryOptions, setCategoryOptions] = useState([
    "salary",
    "freelance",
    "food",
    "entertainment",
  ]);

  useEffect(() => {
    if (transactionType === "income") {
      setCategoryOptions([
        "salary",
        "freelance",
        "dividends",
        "business",
        "investments",
        "retirement",
        "royalties",
        "bonus",
        "other", // Kategori tambahan, seperti "other" untuk kategori kustom
      ]);
    } else if (transactionType === "expense") {
      setCategoryOptions([
        "food",
        "entertainment",
        "investment",
        "travel",
        "education",
        "medical",
        "tax",
        "housing",
        "transportation",
        "debt",
        "shopping",
        "other", // Kategori tambahan, seperti "other" untuk kategori kustom
      ]);
    }
  }, [transactionType]);

  const handleChange = (event) => {
    setValue(event.target.value);

    if (event.target.value < 0) {
      setDialog({ title: "Error", content: "Value of amount cannot be negative" });
      setOpen(true);
      document.getElementById("myForm").reset();
    }
  };

  const onFinish = async (values) => {
    const isValid = validateFormInput(values);
    if (!isValid) return;
    try {
      const user = JSON.parse(localStorage.getItem("expense-tracker-user"));
      setLoading(true);
      if (selectedItemForEdit) {
        await axios.post("/api/transactions/edit-transaction", {
          payload: {
            ...values,
            userid: user._id,
          },
          transactionId: selectedItemForEdit._id,
        });
        getTransactions();
        message.success("Transaction Updated successfully");
      } else {
        await axios.post("/api/transactions/add-transaction", {
          ...values,
          userid: user._id,
        });
        getTransactions();
        message.success("Transaction added successfully");
      }
      setShowAddEditTransactionModal(false);
      setSelectedItemForEdit(null);
      setLoading(false);
    } catch (error) {
      message.error("Something went wrong");
      setLoading(false);
    }
  };

  const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

  const validateFormInput = (values) => {
    const fields = Object.keys(values);
    const emptyFields = fields.filter((field) => values[field] === undefined || values[field] === "");
    if (emptyFields.length === 0) return true;
    const messagePostfix = emptyFields.length > 1 ? "fields cannot be empty!" : "field cannot be empty!";
    const message = `${emptyFields.map(capitalizeFirstLetter).join(", ")} ${messagePostfix}`;
    setOpen(true);
    setDialog({ title: "Validation Error", content: message });
    return false;
  };

  const resetDialog = () => {
    setOpen(false);
    setDialog({ title: "", content: "" });
  };

  const validateDate = (_, value) => {
    const pickedDate = new Date(value);
    const currentDate = new Date();
    return currentDate.valueOf() < pickedDate.valueOf() ? Promise.reject(new Error("Not accepted")) : Promise.resolve();
  };

  const CustomDialog = ({ open, onClose, title, content }) => {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{content}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Modal
      title={selectedItemForEdit ? "Edit Transaction" : "Add Transaction"}
      visible={showAddEditTransactionModal}
      onCancel={() => setShowAddEditTransactionModal(false)}
      footer={false}
    >
      <CustomDialog open={open} onClose={resetDialog} title={dialog.title} content={dialog.content} />
      {loading && <Spinner />}
      <Form layout="vertical" className="transaction-form" onFinish={onFinish} initialValues={selectedItemForEdit} id="myForm">
        <Form.Item label="Amount" name="amount" id="value" value={value} onBlur={handleChange}>
          <InputNumber
            style={{ width: '100%' }}
            formatter={(value) => {
              // Format nilai dengan pemisah ribuan, jutaan, dan seterusnya
              return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }}
            parser={(value) => {
              // Hapus simbol dan pemisah ribuan sebelum menyimpan nilai
              return value.replace(/Rp\s?|(,*)/g, '');
            }}
          />
        </Form.Item>

        <Form.Item label="Type" name="type">
          <Select onChange={(value) => setTransactionType(value)}>
            <Select.Option value="income">Income</Select.Option>
            <Select.Option value="expense">Expense</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Category" name="category">
          <Select>
            {categoryOptions.map((category) => (
              <Select.Option key={category} value={category}>
                {capitalizeFirstLetter(category)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Date" name="date" rules={[{ message: "Invalid Date!", validator: validateDate }]}>
          <Input type="date" />
        </Form.Item>

        <Form.Item label="Reference" name="reference">
          <Input type="text" maxLength={50} />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input type="text" />
        </Form.Item>

        <div className="d-flex justify-content-end">
          <button className="primary" type="submit">
            SAVE
          </button>
        </div>
      </Form>
    </Modal>
  );
}

export default AddEditTransaction;
