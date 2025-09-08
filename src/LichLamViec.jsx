import React, { use, useEffect, useRef, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaRegCalendarAlt, FaEdit, FaTrash } from "react-icons/fa";
import "./LichLamViec.css";
import {
    Modal,
    Button,
    Form,
    ModalBody,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";

function LichLamViec() {
    const [showCalendar, setShowCalendar] = useState(false);
    const [monthSelected, setMonthSelected] = useState(null);
    const today = new Date();
    const calendarRef = useRef(null);

    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDayOffModal, setShowDayOffModal] = useState(false);

    const [tatCaLichLam, setTatCaLichLam] = useState([]);
    const [idToDelete, setIdToDelete] = useState(false);

    const [tongSoGioLam, setTongSoGioLam] = useState(0);
    const [tongSoNgayNghi, setTongSoNgayNghi] = useState(0);

    const [formErrors, setFormErrors] = useState({});

    const api = import.meta.env.VITE_BASE_URL;

    const [formAddData, setFormAddData] = useState({
        soGio: 0,
        ngay: "",
        caLam: "sáng",
        ghiChu: "",
    });

    const [formData, setFormData] = useState({
        soGio: 0,
        ngay: "",
        caLam: "",
        ghiChu: "",
    });

    const [cancelData, setCancelData] = useState({
        soGio: 0,
        ngay: "",
        caLam: "",
        ghiChu: "nghỉ",
    });

    const fetchData = async () => {
        try {
            const response = await fetch(`${api}`, {
                method: "GET",
            });
            if (!response.ok) {
                toast.error("Lỗi khi tải lịch làm việc");
                return;
            }
            const data = await response.json();
            setTatCaLichLam(
                data.sort((a, b) => new Date(b.ngay) - new Date(a.ngay))
            );
            const tongGioLam = data.reduce((acc, cur) => {
                return acc + Number(cur.soGio || 0);
            }, 0);
            setTongSoGioLam(tongGioLam);

            const tongNgayNghi = data.filter((num) => Number(num.soGio) === 0);
            setTongSoNgayNghi(tongNgayNghi.length);
        } catch (error) {
            toast.error("Error fetching data");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateLichLamViec = async (id, data) => {
        try {
            const res = await fetch(`${api}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                toast.error("Cập nhật ngày làm thất bại.");
                return;
            }
            toast.success("Cập nhật ngày làm thành công.");
            setShowEditModal(false);
            fetchData();
        } catch (error) {
            toast.error("Có lỗi xảy ra.");
        }
    };

    const handleSubmitAddLichLamViec = async (formAddData) => {
        const error = validateAddForm(formAddData);
        if (Object.keys(error).length > 0) {
            setFormErrors(error);
            return;
        }
        try {
            const res = await fetch(`${api}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formAddData),
            });
            if (!res.ok) {
                toast.error("Lỗi, không thể tạo ca làm mới.");
                return;
            }
            toast.success("Tạo lịch làm mới thành công.");
            setFormAddData({
                soGio: 0,
                ngay: "",
                caLam: "",
                ghiChu: "",
            })
            setFormErrors("")
            setShowAddModal(false);
            fetchData();
        } catch (error) {
            toast.error(error);
        }
    };

    const validateAddForm = (formAddData) => {
        const errors = {};
        if (!formAddData.soGio || formAddData.soGio <= 0) {
            errors.soGio = "Giờ phải lớn hơn 0 và không được bỏ trống";
        }
        if (!formAddData.ngay) {
            errors.ngay = "Vui lòng chọn ngày";
        }
        return errors;
    };

    const handleSubmitDayOffForm = async (cancelData) => {
        const error = validateDayOffForm(cancelData);
        if (Object.keys(error).length > 0) {
            setFormErrors(error);
            return;
        }
        try {
            const res = await fetch(`${api}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(cancelData),
            });
            if (!res.ok) {
                toast.error("Lỗi, không thể tạo ca nghỉ.");
                return;
            }
            toast.success("Tạo ca nghỉ thành công.");
            setCancelData({
                soGio: 0,
                ngay: "",
                caLam: "",
                ghiChu: "nghỉ",
            })
            setFormErrors("");
            setShowDayOffModal(false);
            fetchData();
        } catch (error) {
            toast.error(error);
        }
    };

    const validateDayOffForm = (cancelData) => {
        const errors = {};
        if (!cancelData.ngay) {
            errors.ngay = "Vui lòng chọn ngày";
        }
        return errors;
    };

    const handleEditDate = (date) => {
        setFormData(date);
        setShowEditModal(true);
    };

    const handleDeleteDate = async (id) => {
        try {
            const res = await fetch(`${api}/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                toast.error("Không thể xóa ca làm.");
                return;
            }
            toast.success("Xóa lịch thành công.");
            setShowDeleteModal(false);
            fetchData();
        } catch (error) {
            toast.error(error);
        }
    };

    const handleDateChange = (date) => {
        setMonthSelected(date);
        setShowCalendar(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
            }
        };
        if (showCalendar) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showCalendar]);

    return (
        <div className="container py-4">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="fw-bold">📅 Lịch Làm Việc</h2>
                <div>
                    <span className="me-3 fw-semibold">
                        {monthSelected
                            ? `Tháng ${monthSelected.getMonth() + 1}/${monthSelected.getFullYear()
                            }`
                            : `Tháng ${today.getMonth() + 1}/${today.getFullYear()}`}
                    </span>
                    <button
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="btn btn-outline-secondary me-2"
                    >
                        <FaRegCalendarAlt size={18} />
                    </button>
                    <button
                        className="btn btn-primary me-2"
                        onClick={() => setShowAddModal(true)}
                    >
                        + Tạo ca làm
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={() => setShowDayOffModal(true)}
                    >
                        + Tạo ca nghỉ
                    </button>
                </div>
            </div>

            {/* Calendar popup */}
            {showCalendar && (
                <div
                    ref={calendarRef}
                    className="position-absolute shadow bg-white rounded p-2"
                    style={{ zIndex: 1000 }}
                >
                    <Calendar
                        view="year"
                        maxDetail="year"
                        locale="vi-VN"
                        onChange={handleDateChange}
                        value={monthSelected || today}
                    />
                </div>
            )}

            {/* Tổng kết */}
            <div className="tong-ket mb-3">
                <span className="badge bg-primary me-2">
                    Số công: {tatCaLichLam.length}
                </span>
                <span className="badge bg-success me-2">
                    Giờ làm: {tongSoGioLam}
                </span>
                <span className="badge bg-danger">
                    Ngày nghỉ: {tongSoNgayNghi}
                </span>
            </div>

            {/* Bảng */}
            <div className="table-responsive">
                <table className="table table-striped table-hover table-bordered text-center align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th>Ngày</th>
                            <th>Giờ</th>
                            <th>Ca làm</th>
                            <th>Ghi chú</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tatCaLichLam &&
                            tatCaLichLam.map((lich) => (
                                <tr key={lich.id}>
                                    <td>{lich.ngay}</td>
                                    <td>
                                        {lich.soGio > 0 ? (
                                            <span className="badge bg-success">{lich.soGio}h</span>
                                        ) : (
                                            <span className="badge bg-secondary">Nghỉ</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className="badge bg-info text-dark">{lich.caLam}</span>
                                    </td>
                                    <td>{lich.ghiChu}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn btn-sm btn-warning"
                                                onClick={() => handleEditDate(lich)}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => {
                                                    setIdToDelete(lich.id);
                                                    setShowDeleteModal(true);
                                                }}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            {/* Modal thêm ca làm */}
            {showAddModal && (
                <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Tạo ca làm</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Floating className="mb-3">
                                <Form.Control
                                    type="number"
                                    placeholder="Số giờ"
                                    value={formAddData.soGio || ""}
                                    onChange={(e) =>
                                        setFormAddData({ ...formAddData, soGio: e.target.value })
                                    }
                                    isInvalid={!!formErrors.soGio}
                                />
                                <label>Số giờ</label>
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.soGio}
                                </Form.Control.Feedback>
                            </Form.Floating>

                            <Form.Floating className="mb-3">
                                <Form.Control
                                    type="date"
                                    placeholder="Chọn ngày"
                                    value={formAddData.ngay}
                                    onChange={(e) =>
                                        setFormAddData({ ...formAddData, ngay: e.target.value })
                                    }
                                    isInvalid={!!formErrors.ngay}
                                />
                                <label>Ngày</label>
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.ngay}
                                </Form.Control.Feedback>
                            </Form.Floating>

                            <Form.Group className="mb-3">
                                <Form.Label>Ca làm</Form.Label>
                                <Form.Select
                                    value={formAddData.caLam}
                                    onChange={(e) =>
                                        setFormAddData({ ...formAddData, caLam: e.target.value })
                                    }
                                >
                                    <option value="sáng">Sáng</option>
                                    <option value="chiều">Chiều</option>
                                    <option value="đêm">Đêm</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Floating className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Ghi chú"
                                    value={formAddData.ghiChu}
                                    onChange={(e) =>
                                        setFormAddData({ ...formAddData, ghiChu: e.target.value })
                                    }
                                />
                                <label>Ghi chú</label>
                            </Form.Floating>

                            <div className="text-end">
                                <Button
                                    variant="primary"
                                    type="button"
                                    onClick={() => handleSubmitAddLichLamViec(formAddData)}
                                    className="me-2"
                                >
                                    Lưu
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Hủy
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>
            )}

            {/* Modal tạo ca nghỉ */}
            {showDayOffModal && (
                <Modal show={showDayOffModal} onHide={() => setShowDayOffModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Tạo ca nghỉ</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Floating className="mb-3">
                                <Form.Control
                                    type="date"
                                    placeholder="Chọn ngày"
                                    value={cancelData.ngay}
                                    onChange={(e) =>
                                        setCancelData({ ...cancelData, ngay: e.target.value })
                                    }
                                    isInvalid={!!formErrors.ngay}
                                />
                                <label>Ngày nghỉ</label>
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.ngay}
                                </Form.Control.Feedback>
                            </Form.Floating>

                            <Form.Floating className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Ghi chú"
                                    value={cancelData.ghiChu}
                                    onChange={(e) =>
                                        setCancelData({ ...cancelData, ghiChu: e.target.value })
                                    }
                                />
                                <label>Ghi chú</label>
                            </Form.Floating>

                            <div className="text-end">
                                <Button
                                    variant="primary"
                                    type="button"
                                    onClick={() => handleSubmitDayOffForm(cancelData)}
                                    className="me-2"
                                >
                                    Lưu
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowDayOffModal(false)}
                                >
                                    Hủy
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>
            )}


            {/* Modal xóa */}
            {showDeleteModal && (
                <Modal
                    show={showDeleteModal}
                    onHide={() => setShowDeleteModal(false)}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Xác nhận xóa</Modal.Title>
                    </Modal.Header>
                    <ModalBody className="text-center">
                        <p>Bạn có chắc chắn muốn xóa ca làm này?</p>
                        <Button
                            variant="danger"
                            onClick={() => handleDeleteDate(idToDelete)}
                            className="me-2"
                        >
                            Có
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Không
                        </Button>
                    </ModalBody>
                </Modal>
            )}

            {/* Modal chỉnh sửa */}
            {showEditModal && (
                <Modal
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Chỉnh sửa ca làm</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Floating className="mb-3">
                                <Form.Control
                                    type="number"
                                    placeholder="Số giờ"
                                    value={formData.soGio || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, soGio: e.target.value })
                                    }
                                />
                                <label>Số giờ</label>
                            </Form.Floating>

                            <Form.Floating className="mb-3">
                                <Form.Control
                                    type="date"
                                    placeholder="Chọn ngày"
                                    value={formData.ngay}
                                    onChange={(e) =>
                                        setFormData({ ...formData, ngay: e.target.value })
                                    }
                                />
                                <label>Ngày</label>
                            </Form.Floating>

                            <Form.Group className="mb-3">
                                <Form.Label>Ca làm</Form.Label>
                                <Form.Select
                                    value={formData.caLam}
                                    onChange={(e) =>
                                        setFormData({ ...formData, caLam: e.target.value })
                                    }
                                >
                                    <option value="sáng">Sáng</option>
                                    <option value="chiều">Chiều</option>
                                    <option value="đêm">Đêm</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Floating className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Ghi chú"
                                    value={formData.ghiChu}
                                    onChange={(e) =>
                                        setFormData({ ...formData, ghiChu: e.target.value })
                                    }
                                />
                                <label>Ghi chú</label>
                            </Form.Floating>

                            <div className="text-end">
                                <Button
                                    variant="primary"
                                    type="button"
                                    onClick={() => updateLichLamViec(formData.id, formData)}
                                    className="me-2"
                                >
                                    Lưu thay đổi
                                </Button>
                                <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                                    Hủy
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>
            )}

        </div>
    );
}

export default LichLamViec;
