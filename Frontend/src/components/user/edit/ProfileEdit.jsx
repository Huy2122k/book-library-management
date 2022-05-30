import { LoadingOutlined } from '@ant-design/icons';
import { Card, Col, Divider, Menu, message, Row, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useParams } from 'react-router-dom';
import UserService from '../../../services/user.service';
import ChangePassword from './ChangePassword';
import InfoEdit from './InfoEdit';
import './style.css';
const items = [
    {
        key: 'editInfo',
        icon: '',
        label: 'Edit Info',
        type: "'group'"
    },
    {
        key: 'verify',
        icon: '',
        label: 'Verify Identify Card',
        type: "'group'"
    },
    {
        key: 'password',
        icon: '',
        label: 'Change Password',
        type: "'group'"
    },
    {
        key: 'email',
        icon: '',
        label: 'Verify Email',
        type: "'group'"
    }
];

const ProfileEdit = () => {
    const params = useParams();
    const [tabId, setTabId] = useState(params.tab);
    const [currentUser, setCurrentUser] = useState();
    const renderTab = (tabKey) => {
        if (!currentUser) {
            return <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />;
        }
        switch (tabKey) {
            case 'editInfo':
                return <InfoEdit user={currentUser} onUpdateInfo={handleUpdateInfoRequest} />;
            case 'verify':
                break;
            case 'password':
                return <ChangePassword handleChangePassword={handleChangePassword} />;
            case 'editInfo':
                break;
            case 'email':
                break;
            default:
                return <InfoEdit user={currentUser} onUpdateInfo={handleUpdateInfoRequest} />;
        }
    };
    const fetchAccountData = async () => {
        if (!params.id) return;
        try {
            const userData = await UserService.getAccountInfo(params.id);
            console.log(userData.data.accountInfo);
            setCurrentUser(userData.data.accountInfo);
        } catch (error) {
            console.log(error);
            message.error('Cannot get user info!');
        }
    };
    const handleUpdateInfoRequest = async (body) => {
        try {
            const userData = await UserService.updateAccountInfo(params.id, body);
            message.success(userData.data.message);
        } catch (error) {
            console.log(error);
            message.error('Update info failed!');
        }
    };
    const handleChangePassword = async (values) => {
        try {
            const userData = await UserService.changePassword({
                UserName: currentUser.UserName,
                Password: values.Password,
                NewPassword: values.NewPassword
            });
            message.success(userData.data.message);
        } catch (error) {
            console.log(error);
            message.error('Update info failed!');
        }
    };
    useEffect(() => {
        setTabId(params.tab);
    }, [params.tab]);
    useEffect(() => {
        fetchAccountData();
    }, [params.id]);
    return (
        <Row gutter={[24, 24]}>
            <Col xs={24} sm={6} md={6} lg={6} xl={6}>
                <Card className="sidebar-card-01">
                    <h1 style={{ textAlign: 'center', marginTop: '10px' }}>Profile Edit</h1>
                    <Divider
                        style={{
                            margin: '5px 0px'
                        }}
                        dashed
                    />
                    <Menu
                        style={{ width: '100%', justifyContent: 'center' }}
                        defaultSelectedKeys={['editInfo']}
                        mode={isMobile ? 'horizontal' : 'inline'}
                        items={items}
                        onClick={(e) => setTabId(e.key)}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={18} md={18} lg={18} xl={18}>
                <Card className="sidebar-card-02">{renderTab(tabId)}</Card>
            </Col>
        </Row>
    );
};

export default ProfileEdit;