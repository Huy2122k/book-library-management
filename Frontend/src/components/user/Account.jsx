import {
    CalendarOutlined,
    ContactsOutlined,
    HomeOutlined,
    MobileOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { Avatar, Card, Col, Divider, Row } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import UserService from '../../services/user.service';
import './style.css';
import CommentTabs from './tabs/Comment';
import LendingListInfo from './tabs/Lending/LendingListInfo';
import RatingList from './tabs/RatingList';
const tabList = [
    {
        key: 'comment',
        tab: 'Comment'
    },
    {
        key: 'rating',
        tab: 'Rating'
    },
    {
        key: 'lending',
        tab: 'Book Lending'
    }
];

const Account = () => {
    const params = useParams();
    const [currentUser, setCurrentUser] = useState();
    const [commentInfo, setCommentInfo] = useState([]);
    const [ratingInfo, setRatingInfo] = useState([]);
    const [lendingInfo, setLendingInfo] = useState([]);

    const [wishList, setWishList] = useState();
    const [loading, setLoading] = useState(false);
    const [tabKey, setTabKey] = useState('comment');

    const renderChildrenByTabKey = (tabValue) => {
        let tab;
        if (tabValue === 'comment') {
            tab = <CommentTabs commentInfo={commentInfo} />;
        }
        if (tabValue === 'rating') {
            tab = <RatingList ratingInfo={ratingInfo} />;
        }
        if (tabValue === 'lending') {
            tab = <LendingListInfo lendingInfo={lendingInfo} />;
        }
        return (
            <div className="tabs-content" key={tabValue}>
                {tab}
            </div>
        );
    };
    const fetchAccountData = async () => {
        if (!params.id) return;
        try {
            setLoading(true);
            const userData = await UserService.getAccountInfo(params.id);
            setLoading(false);
            console.log(userData.data.commentInfo);
            setCurrentUser(userData.data.accountInfo);
            setCommentInfo(userData.data.commentInfo);
            setRatingInfo(userData.data.ratingInfo);
            setRatingInfo(userData.data.ratingInfo);
            setLendingInfo(userData.data.lendingInfo);
        } catch (error) {
            console.log(error);
            setLoading(false);
            message.error('Cannot get user info!');
        }
    };
    const fetchWishListData = async () => {
        if (!params.id) return;
        try {
            const wishListData = await UserService.getWishList(params.id);
            console.log(wishListData.data);
            setWishList(wishListData.data);
        } catch (error) {
            console.log(error);
            setLoading(false);
            message.error('Cannot get wishlist!');
        }
    };
    useEffect(() => {
        fetchWishListData();
        fetchAccountData();
    }, [params.id]);

    return (
        <Row gutter={[24, 24]}>
            <Col xs={24} sm={24} md={24} lg={7} xl={7}>
                <Card
                    bordered={false}
                    style={{
                        marginBottom: 24
                    }}
                    loading={loading}>
                    {!loading && currentUser && (
                        <div>
                            <div className="avatarHolder">
                                <img
                                    alt=""
                                    src={
                                        currentUser.ImageURL
                                            ? currentUser.ImageURL
                                            : 'https://joeschmoe.io/api/v1/random'
                                    }
                                />
                                <div className="name">{currentUser.UserName}</div>
                                <div>{currentUser.IdentityNum}</div>
                            </div>
                            <div className="detail">
                                <p>
                                    <ContactsOutlined className="iconInfo" />
                                    {currentUser.Email}
                                </p>
                                <p>
                                    <MobileOutlined className="iconInfo" />
                                    {currentUser.Phone}
                                </p>
                                <p>
                                    <CalendarOutlined className="iconInfo" />
                                    {moment(currentUser.Birthday).format('DD-MM-YYYY')}
                                </p>
                                <p>
                                    <TeamOutlined className="iconInfo" />
                                    {'Gender: ' +
                                        (currentUser.Gender == 'F'
                                            ? 'Female'
                                            : currentUser.Gender == 'M'
                                            ? 'Male'
                                            : 'Other')}
                                </p>
                                <p>
                                    <HomeOutlined className="iconInfo" />
                                    {currentUser.Address}
                                </p>
                            </div>
                            <Divider dashed />
                            <div className="intro">
                                {currentUser.Introduction ? currentUser.Introduction : 'No intro'}
                            </div>
                            <Divider
                                style={{
                                    marginTop: 16
                                }}
                                dashed
                            />
                            <div className="team">
                                <div className="teamTitle">Favorite</div>
                                <Row gutter={36}>
                                    {wishList &&
                                        wishList.map((item) => (
                                            <Col key={item.BookID} lg={24} xl={12}>
                                                <Link to={'/books/' + item.BookID}>
                                                    <Avatar size="large" src={item.ImageURL} />
                                                    {item.BookName}
                                                </Link>
                                            </Col>
                                        ))}
                                </Row>
                            </div>
                        </div>
                    )}
                </Card>
            </Col>
            <Col xs={24} sm={24} md={24} lg={17} xl={17}>
                <Card
                    className="tabsCard"
                    bordered={false}
                    tabList={tabList}
                    activeTabKey={tabKey}
                    onTabChange={(_tabKey) => {
                        setTabKey(_tabKey);
                    }}>
                    {renderChildrenByTabKey(tabKey)}
                </Card>
            </Col>
        </Row>
    );
};

export default Account;