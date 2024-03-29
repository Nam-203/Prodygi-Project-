import {
  Button,
  Col,
  Form,
  Select,
  Space,
  Row,
  Modal,
  Input,
  Upload,
  InputNumber,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Excel } from "antd-table-saveas-excel";
import React, { useRef } from "react";
import { WrapperHeader, WrapperUploadFile } from "./style";
import TableComponent from "../TableComponent/TableComponent";
import { useState } from "react";
import InputComponent from "../InputComponent/InputComponent";
import { getBase64, renderOptions } from "../../utils";
import * as ProductService from "../../services/ProductService";
import { useMutationHooks } from "../../hooks/useMutationHook";
import Loading from "../../components/LoadingComponent/Loading";
import { useEffect } from "react";
import * as message from "../../components/Message/Message";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import ModalComponent from "../ModalComponent/ModalComponent";
import { useMemo } from "react";
import TypeChart from "../TypeChart/TypeChart";
import "./style.scss";
import { IoIosAdd } from "react-icons/io";
import { CiExport } from "react-icons/ci";
import AdminCategory from "../AdminCategory/AdminCategory";

const AdminProduct = ({ keySelected }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rowSelected, setRowSelected] = useState("");
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const user = useSelector((state) => state?.user);
  const searchInput = useRef(null);
  const { TextArea } = Input;
  const inittial = () => ({
    name: "",
    price: "",
    description: "",
    rating: "",
    image: "",
    imageHover: "",
    imageDetail: "",
    type: "",
    countInStock: "",
    newType: "",
    discount: "",
  });
  const [stateProduct, setStateProduct] = useState(inittial());
  const [stateProductDetails, setStateProductDetails] = useState(inittial());

  const [form] = Form.useForm();

  const mutation = useMutationHooks((data) => {
    const {
      name,
      price,
      description,
      rating,
      image,
      imageHover,
      imageDetail,
      type,
      countInStock,
      discount,
    } = data;
    const res = ProductService.createProduct({
      name,
      price,
      description,
      rating,
      image,
      imageHover,
      imageDetail,
      type,
      countInStock,
      discount,
    });
    return res;
  });
  const mutationUpdate = useMutationHooks((data) => {
    const { id, token, ...rests } = data;
    const res = ProductService.updateProduct(id, token, { ...rests });
    return res;
  });

  const mutationDeleted = useMutationHooks((data) => {
    const { id, token } = data;
    const res = ProductService.deleteProduct(id, token);
    return res;
  });

  const mutationDeletedMany = useMutationHooks((data) => {
    const { token, ...ids } = data;
    const res = ProductService.deleteManyProduct(ids, token);
    return res;
  });

  const getAllProducts = async () => {
    const res = await ProductService.getAllProduct();
    const dataProduct = res;
    return res;
  };

  const fetchGetDetailsProduct = async (rowSelected) => {
    const res = await ProductService.getDetailsProduct(rowSelected);
    if (res?.data) {
      setStateProductDetails({
        name: res?.data?.name,
        price: res?.data?.price,
        description: res?.data?.description,
        rating: res?.data?.rating,
        image: res?.data?.image,
        imageHover: res?.data?.imageHover,
        imageDetail: res?.data?.imageDetail,
        type: res?.data?.type,
        countInStock: res?.data?.countInStock,
        discount: res?.data?.discount,
      });
    }
    setIsLoadingUpdate(false);
  };

  useEffect(() => {
    if (!isModalOpen) {
      form.setFieldsValue(stateProductDetails);
    } else {
      form.setFieldsValue(inittial());
    }
  }, [form, stateProductDetails, isModalOpen]);

  useEffect(() => {
    if (rowSelected && isOpenDrawer) {
      setIsLoadingUpdate(true);
      fetchGetDetailsProduct(rowSelected);
    }
  }, [rowSelected, isOpenDrawer]);

  const handleDetailsProduct = () => {
    setIsOpenDrawer(true);
  };

  const handleDeleteManyProducts = (ids) => {
    mutationDeletedMany.mutate(
      { ids: ids, token: user?.access_token },
      {
        onSettled: () => {
          queryProduct.refetch();
        },
      }
    );
  };

  const fetchAllTypeProduct = async () => {
    const res = await ProductService.getAllTypeProduct();
    return res;
  };

  const { data, isLoading, isSuccess, isError } = mutation;
  const {
    data: dataUpdated,
    isLoading: isLoadingUpdated,
    isSuccess: isSuccessUpdated,
    isError: isErrorUpdated,
  } = mutationUpdate;
  const {
    data: dataDeleted,
    isLoading: isLoadingDeleted,
    isSuccess: isSuccessDelected,
    isError: isErrorDeleted,
  } = mutationDeleted;
  const {
    data: dataDeletedMany,
    isLoading: isLoadingDeletedMany,
    isSuccess: isSuccessDelectedMany,
    isError: isErrorDeletedMany,
  } = mutationDeletedMany;

  const queryProduct = useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
  });
  const typeProduct = useQuery({
    queryKey: ["type-product"],
    queryFn: fetchAllTypeProduct,
  });
  const { isLoading: isLoadingProducts, data: products } = queryProduct;
  const renderAction = () => {
    return (
      <div>
        <DeleteOutlined
          className="actionBtn deleteBtn"
          onClick={() => setIsModalOpenDelete(true)}
        />
        <EditOutlined
          className="actionBtn editBtn"
          onClick={handleDetailsProduct}
        />
      </div>
    );
  };
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    // setSearchText(selectedKeys[0]);
    // setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    // setSearchText('');
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <InputComponent
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1890ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.length - b.name.length,
      ...getColumnSearchProps("name"),
    },
    {
      title: "Price",
      dataIndex: "price",
      sorter: (a, b) => a.price - b.price,
      filters: [
        {
          text: ">= 50",
          value: ">=",
        },
        {
          text: "<= 50",
          value: "<=",
        },
      ],
      onFilter: (value, record) => {
        if (value === ">=") {
          return record.price >= 50;
        }
        return record.price <= 50;
      },
    },
    {
      title: "Rating",
      dataIndex: "rating",
      sorter: (a, b) => a.rating - b.rating,
      filters: [
        {
          text: ">= 3",
          value: ">=",
        },
        {
          text: "<= 3",
          value: "<=",
        },
      ],
      onFilter: (value, record) => {
        if (value === ">=") {
          return Number(record.rating) >= 3;
        }
        return Number(record.rating) <= 3;
      },
    },
    {
      title: "Type",
      dataIndex: "type",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: renderAction,
    },
  ];
  const dataTable =
    products?.data?.length &&
    products?.data?.map((product) => {
      return { ...product, key: product._id };
    });
  console.log("dataTAble", dataTable);

  useEffect(() => {
    if (isSuccess && data?.status === "OK") {
      message.success();
      handleCancel();
    } else if (isError) {
      message.error();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isSuccessDelectedMany && dataDeletedMany?.status === "OK") {
      message.success();
    } else if (isErrorDeletedMany) {
      message.error();
    }
  }, [isSuccessDelectedMany]);

  useEffect(() => {
    if (isSuccessDelected && dataDeleted?.status === "OK") {
      message.success();
      handleCancelDelete();
    } else if (isErrorDeleted) {
      message.error();
    }
  }, [isSuccessDelected]);

  // const handleCloseDrawer = () => {
  //   setIsOpenDrawer(false);
  //   setStateProductDetails({
  //     name: "",
  //     price: "",
  //     description: "",
  //     rating: "",
  //     image: "",
  //     imageHover: "",
  //     type: "",
  //     countInStock: "",
  //   });
  //   form.resetFields();
  // };

  useEffect(() => {
    if (isSuccessUpdated && dataUpdated?.status === "OK") {
      message.success();
      // handleCloseDrawer();
    } else if (isErrorUpdated) {
      message.error();
    }
  }, [isSuccessUpdated]);

  const handleCancelDelete = () => {
    setIsModalOpenDelete(false);
  };

  const handleDeleteProduct = () => {
    mutationDeleted.mutate(
      { id: rowSelected, token: user?.access_token },
      {
        onSettled: () => {
          queryProduct.refetch();
        },
      }
    );
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setStateProduct({
      name: "",
      price: "",
      description: "",
      rating: "",
      image: "",
      imageHover: "",
      imageDetail: "",
      type: "",
      countInStock: "",
      discount: "",
    });
    form.resetFields();
  };

  const onFinish = () => {
    const params = {
      name: stateProduct.name,
      price: stateProduct.price,
      description: stateProduct.description,
      rating: stateProduct.rating,
      image: stateProduct.image,
      imageHover: stateProduct.imageHover,
      imageDetail: stateProduct.imageDetail,
      type:
        stateProduct.type === "add_type"
          ? stateProduct.newType
          : stateProduct.type,
      countInStock: stateProduct.countInStock,
      discount: stateProduct.discount,
    };
    mutation.mutate(params, {
      onSettled: () => {
        queryProduct.refetch();
      },
    });
  };

  const handleOnchange = (e) => {
    setStateProduct({
      ...stateProduct,
      [e.target.name]: e.target.value,
    });
  };

  const handleOnchangeDetails = (e) => {
    setStateProductDetails({
      ...stateProductDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleOnchangeAvatar = async ({ fileList }) => {
    const file = fileList[0];
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setStateProduct({
      ...stateProduct,
      image: file.preview,
    });
  };
  const handleOnchangeAvatarImageHover = async ({ fileList }) => {
    const file = fileList[0];
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setStateProduct({
      ...stateProduct,
      imageHover: file.preview,
    });
  };
  const handleOnchangeAvatarImageDetail = async ({ fileList }) => {
    const file = fileList[0];
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setStateProduct({
      ...stateProduct,
      imageDetail: file.preview,
    });
  };

  const handleOnchangeAvatarDetails = async ({ fileList }) => {
    const file = fileList[0];
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setStateProductDetails({
      ...stateProductDetails,
      image: file.preview,
    });
  };
  const handleOnchangeAvatarDetailsImageHover = async ({ fileList }) => {
    const file = fileList[0];
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setStateProductDetails({
      ...stateProductDetails,
      imageHover: file.preview,
    });
  };
  const handleOnchangeAvatarDetailsImageDetail = async ({ fileList }) => {
    const file = fileList[0];
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setStateProductDetails({
      ...stateProductDetails,
      imageDetail: file.preview,
    });
  };
  const onUpdateProduct = () => {
    mutationUpdate.mutate(
      { id: rowSelected, token: user?.access_token, ...stateProductDetails },
      {
        onSettled: () => {
          queryProduct.refetch();
        },
      }
    );
  };

  const handleChangeSelect = (value) => {
    setStateProduct({
      ...stateProduct,
      type: value,
    });
  };

  //export excel----------------------------------------------------
  const newColumnExport = useMemo(() => {
    const arr = columns?.filter((col) => col.dataIndex !== "action");
    return arr;
  }, [columns]);

  const exportExcel = () => {
    const excel = new Excel();
    excel
      .addSheet("product")
      .addColumns(newColumnExport)
      .addDataSource(dataTable)
      .saveAs("Product.xlsx");
  };
  //------------------------------end----------------------------------------

  // Hàm tính số lượng các loại

  const calculateTypeCounts = (data) => {
    const typeCounts = {};

    data.forEach((item) => {
      const type = item.type;
      if (typeCounts[type]) {
        typeCounts[type].uv++;
      } else {
        typeCounts[type] = { type, uv: 1 };
      }
    });
    return Object.values(typeCounts);
  };
  // Gọi hàm
  const typeCounts = calculateTypeCounts(dataTable);
  console.log("TypeCounts", typeCounts);

  //---------------------------------------------------------------------------------------------------

  //---------------------------------------------------------------------------------------------------

  return (
    <div>
      {/* <TypeChart typeCounts={typeCounts}/> */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingRight: "20px",
          backgroundColor: "white",
          padding: "20px",
          marginBottom: "-20px",
        }}
      >
        <div style={{ display: "flex" }}>
          <WrapperHeader style={{ fontWeight: "bold", fontSize: "20px" }}>
            PRODUCT MANAGEMENT
          </WrapperHeader>
          <Button
            style={{
              marginLeft: "20px",
              borderRadius: "5px",
              height: "38px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            onClick={() => {
              exportExcel();
            }}
          >
            {" "}
            <span style={{ fontSize: 20, paddingRight: "5px" }}>
              <CiExport />
            </span>{" "}
            Export Excel
          </Button>
        </div>
        <Button
          style={{
            borderRadius: "5px",
            height: "38px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={() => setIsModalOpen(true)}
        >
          {" "}
          <span style={{ fontSize: 20, paddingRight: " 5px" }}>
            <IoIosAdd />
          </span>{" "}
          Add Product{" "}
        </Button>
      </div>
      <div style={{ marginTop: "20px" }}>
        <TableComponent
          handleDeleteMany={handleDeleteManyProducts}
          columns={columns}
          isLoading={isLoadingProducts}
          data={dataTable}
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                setRowSelected(record._id);
              },
            };
          }}
        />
      </div>

      {/* ------------------------------------------MODAL ADD ----------------------------------------- */}
      <ModalComponent
        forceRender
        title="ADD PRODUCT"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={"50%"}
      >
        <Form name="basic" onFinish={onFinish} autoComplete="on" form={form}>
          <Row gutter={15}>
            <Col span={12}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Name"
                name="name"
                rules={[{ required: true, message: "Please input your name!" }]}
              >
                <InputComponent
                  value={stateProduct["name"]}
                  onChange={handleOnchange}
                  name="name"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Type"
                name="type"
                rules={[{ required: true, message: "Please select a type!" }]}
              >
                <Select
                  name="type"
                  value={stateProduct.type}
                  onChange={handleChangeSelect}
                  options={renderOptions(typeProduct?.data?.data)}
                />
              </Form.Item>
            </Col>
            {stateProduct.type === "add_type" && (
              <Col span={12}>
                <Form.Item
                  labelCol={{ span: 24 }}
                  label="New type"
                  name="newType"
                  rules={[
                    {
                      required: true,
                      message: "Please input your new type!",
                      // Thêm điều kiện kiểm tra nếu type là 'add_type'
                      validator: (_, value) =>
                        stateProduct.type === "add_type" && !value
                          ? Promise.reject("Please input your new type!")
                          : Promise.resolve(),
                    },
                  ]}
                >
                  <InputComponent
                    value={stateProduct.newType}
                    onChange={handleOnchange}
                    name="newType"
                  />
                </Form.Item>
              </Col>
            )}
            <Col span={6}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Count inStock"
                name="countInStock"
                rules={[
                  {
                    required: true,
                    message: "Please input your count inStock!",
                  },
                ]}
              >
                <InputComponent
                  value={stateProduct.countInStock}
                  onChange={handleOnchange}
                  name="countInStock"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Price"
                name="price"
                rules={[
                  { required: true, message: "Please input your count price!" },
                ]}
              >
                <InputComponent
                  value={stateProduct.price}
                  onChange={handleOnchange}
                  name="price"
                />
              </Form.Item>
            </Col>
            {/* <Col span={6}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Price"
                name="price"
                rules={[
                  { required: true, message: "Please input your count price!" },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  value={stateProduct.price}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  addonAfter="$"
                  onChange={handleOnchange}
                  name="price"
                />
              </Form.Item>
            </Col> */}
            <Col span={6}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Rating"
                name="rating"
                rules={[
                  {
                    required: true,
                    message: "Please input your count rating!",
                  },
                ]}
              >
                <InputComponent
                  value={stateProduct.rating}
                  onChange={handleOnchange}
                  name="rating"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Discount"
                name="discount"
                rules={[
                  {
                    required: true,
                    message: "Please input your discount of product!",
                  },
                ]}
              >
                <InputComponent
                  value={stateProduct.discount}
                  onChange={handleOnchange}
                  name="discount"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Description"
                name="description"
                rules={[
                  {
                    required: true,
                    message: "Please input your count description!",
                  },
                ]}
              >
                <TextArea
                  rows={2}
                  value={stateProduct.description}
                  onChange={handleOnchange}
                  name="description"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Image"
                name="image"
                rules={[
                  { required: true, message: "Please input your count image!" },
                ]}
              >
                <WrapperUploadFile onChange={handleOnchangeAvatar} maxCount={1}>
                  <Button>Select File</Button>
                  {stateProduct?.image && (
                    <img
                      src={stateProduct?.image}
                      style={{
                        height: "60px",
                        width: "60px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginLeft: "10px",
                      }}
                      alt="avatar"
                    />
                  )}
                </WrapperUploadFile>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="ImageHover"
                name="imageHover"
                rules={[
                  {
                    required: true,
                    message: "Please input your count imageHover!",
                  },
                ]}
              >
                <WrapperUploadFile
                  onChange={handleOnchangeAvatarImageHover}
                  maxCount={1}
                >
                  <Button>Select File</Button>
                  {stateProduct?.imageHover && (
                    <img
                      src={stateProduct?.imageHover}
                      style={{
                        height: "60px",
                        width: "60px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginLeft: "10px",
                      }}
                      alt="avatar"
                    />
                  )}
                </WrapperUploadFile>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="ImageDetail"
                name="ImageDetail"
                rules={[
                  {
                    required: true,
                    message: "Please input your count imageDetail!",
                  },
                ]}
              >
                <WrapperUploadFile
                  onChange={handleOnchangeAvatarImageDetail}
                  maxCount={1}
                >
                  <Button>Select File</Button>
                  {stateProduct?.imageDetail && (
                    <img
                      src={stateProduct?.imageDetail}
                      style={{
                        height: "60px",
                        width: "60px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginLeft: "10px",
                      }}
                      alt="avatar"
                    />
                  )}
                </WrapperUploadFile>
              </Form.Item>
            </Col>
            <Form.Item wrapperCol={{ offset: 20, span: 16 }}>
              <Button
                style={{
                  border: "none",
                  backgroundColor: "blue",
                  color: "white",
                  borderRadius: "5px",
                }}
                type="primary"
                htmlType="submit"
              >
                Submitt
              </Button>
            </Form.Item>
          </Row>
        </Form>

        {/* </Loading> */}
      </ModalComponent>
      {/* -----------------------------------------------END------------------------------------------------ */}

      {/* --------------------------------------MODAL UPDATE--------------------------------------- */}
      <ModalComponent
        title="Product detail"
        isOpen={isOpenDrawer}
        onCancel={() => setIsOpenDrawer(false)}
        width="50%"
        footer={null}
      >
        <Form
          name="basic"
          onFinish={onUpdateProduct}
          autoComplete="on"
          form={form}
        >
          <Row gutter={15}>
            <Col span={12}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Name"
                name="name"
                rules={[{ required: true, message: "Please input your name!" }]}
              >
                <InputComponent
                  value={stateProductDetails["name"]}
                  onChange={handleOnchangeDetails}
                  name="name"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Type"
                name="type"
                rules={[{ required: true, message: "Please input your type!" }]}
              >
                <Select
                  name="type"
                  value={stateProduct.type}
                  onChange={handleChangeSelect}
                  options={renderOptions(typeProduct?.data?.data)}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Count inStock"
                name="countInStock"
                rules={[
                  {
                    required: true,
                    message: "Please input your count inStock!",
                  },
                ]}
              >
                <InputComponent
                  value={stateProductDetails.countInStock}
                  onChange={handleOnchangeDetails}
                  name="countInStock"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Price"
                name="price"
                rules={[
                  { required: true, message: "Please input your count price!" },
                ]}
              >
                <Input
                  value={stateProductDetails.price}
                  onChange={handleOnchangeDetails}
                  name="price"
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Rating"
                name="rating"
                rules={[
                  {
                    required: true,
                    message: "Please input your count rating!",
                  },
                ]}
              >
                <InputComponent
                  value={stateProductDetails.rating}
                  onChange={handleOnchangeDetails}
                  name="rating"
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Discount"
                name="discount"
                rules={[
                  {
                    required: true,
                    message: "Please input your discount of product!",
                  },
                ]}
              >
                <InputComponent
                  value={stateProductDetails.discount}
                  onChange={handleOnchangeDetails}
                  name="discount"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Description"
                name="description"
                rules={[
                  {
                    required: true,
                    message: "Please input your count description!",
                  },
                ]}
              >
                <TextArea
                  rows={2}
                  value={stateProductDetails.description}
                  onChange={handleOnchangeDetails}
                  name="description"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="Image"
                name="image"
                rules={[
                  { required: true, message: "Please input your count image!" },
                ]}
              >
                <WrapperUploadFile
                  onChange={handleOnchangeAvatarDetails}
                  maxCount={1}
                >
                  <Button>Select File</Button>
                  {stateProductDetails?.image && (
                    <img
                      src={stateProductDetails?.image}
                      style={{
                        height: "60px",
                        width: "60px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginLeft: "10px",
                      }}
                      alt="avatar"
                    />
                  )}
                </WrapperUploadFile>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="ImageHover"
                name="imageHover"
                rules={[
                  { required: true, message: "Please input your count image!" },
                ]}
              >
                <WrapperUploadFile
                  onChange={handleOnchangeAvatarDetailsImageHover}
                  maxCount={1}
                >
                  <Button>Select File</Button>
                  {stateProductDetails?.imageHover && (
                    <img
                      src={stateProductDetails?.imageHover}
                      style={{
                        height: "60px",
                        width: "60px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginLeft: "10px",
                      }}
                      alt="avatar"
                    />
                  )}
                </WrapperUploadFile>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                labelCol={{ span: 24 }}
                label="ImageDetail"
                name="ImageDetail"
                rules={[
                  { required: true, message: "Please input your count image!" },
                ]}
              >
                <WrapperUploadFile
                  onChange={handleOnchangeAvatarDetailsImageDetail}
                  maxCount={1}
                >
                  <Button>Select File</Button>
                  {stateProductDetails?.imageDetail && (
                    <img
                      src={stateProductDetails?.imageDetail}
                      style={{
                        height: "60px",
                        width: "60px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginLeft: "10px",
                      }}
                      alt="avatar"
                    />
                  )}
                </WrapperUploadFile>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item wrapperCol={{ offset: 20, span: 24 }}>
                <Button
                  style={{
                    backgroundColor: "red",
                    border: "none",
                    borderRadius: "3px",
                  }}
                  type="primary"
                  htmlType="submit"
                >
                  Apply
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </ModalComponent>
      {/* ---------------------------------end----------------------------------------- */}
      <Modal
        title="Xóa sản phẩm"
        open={isModalOpenDelete}
        onCancel={handleCancelDelete}
        onOk={handleDeleteProduct}
        okButtonProps={{ className: "custom-ok-button" }}
        cancelButtonProps={{ className: "custom-cancel-button" }}
      >
        <Loading isLoading={isLoadingDeleted}>
          <div>Bạn có chắc xóa sản phẩm này không?</div>
        </Loading>
      </Modal>
    </div>
  );
};

export default AdminProduct;
