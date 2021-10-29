import "./post.css";

// firebase imports
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../../config/firebaseConfig";

import MoreVertIcon from "@material-ui/icons/MoreVert";
import { useEffect, useState } from "react";
import axios from "../../axios";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import DefaultProfilePic from "../../assets/profile.png";
import LikeIcon from "../../assets/like.png";
import { Avatar, IconButton, Menu, MenuItem } from "@material-ui/core";
import { useSelector } from "react-redux";

export default function Post({ post }) {
  const [like, setLike] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState({});

  const currentUser = useSelector((state) => state.auth.user);

  const [profilePic, setProfilePic] = useState(DefaultProfilePic);
  const [postImg, setPostImg] = useState();

  useEffect(() => {
    setIsLiked(post.likes.includes(currentUser?._id));
    if (post.img) getPostImage(post.img);
  }, [currentUser._id, post.likes, post.img]);

  useEffect(() => {
    // getting profile pic from firebase storage
    const getImages = async (user) => {
      await getDownloadURL(
        ref(storage, `${user.email}/profile/${user.profilePicture}`)
      )
        .then((url) => setProfilePic(url))
        .catch((e) => console.log(e));
    };

    const fetchUser = async () => {
      await axios
        .get(`/users?userId=${post.userId}`)
        .then((res) => {
          setUser(res.data);
          getImages(res.data);
        })
        .catch((error) => {
          console.log(error);
        });
    };

    fetchUser();
  }, [post.userId]);

  const likeHandler = () => {
    try {
      axios.put("/posts/" + post._id + "/like", { userId: currentUser?._id });
    } catch (error) {
      console.log(error);
    }
    setLike(isLiked ? like - 1 : like + 1);
    setIsLiked(!isLiked);
  };

  // post menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const openPostMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const closePostMenu = (option) => {
    setAnchorEl(null);
    console.log(option);
  };

  // post menu actions
  const deletePost = async () => {
    setAnchorEl(null);
    try {
      await axios.delete("/posts/" + post._id);
      window.location.reload();
    } catch (e) {
      console.log(e);
    }
  };

  // getting post image
  const getPostImage = async (filename) => {
    await getDownloadURL(ref(storage, `${user.email}/uploads/${filename}`))
      .then((url) => {
        setPostImg(url);
      })
      .catch((e) => {
        console.log(e);
        return;
      });
  };

  return (
    <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft">
            <Link to={`/profile/${user?.username}`}>
              <Avatar
                className="postProfileImg"
                alt={user.username}
                src={profilePic}
              />
              {/* <img className="" src={profilePic} alt="" /> */}
            </Link>
            <span className="postUsername">{user?.username}</span>
            <span className="postDate">{format(post.createdAt)}</span>
          </div>
          {currentUser._id === user._id ? (
            <div className="postTopRight">
              <IconButton
                aria-label="more"
                aria-controls="long-menu"
                aria-haspopup="true"
                onClick={openPostMenu}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                id="long-menu"
                anchorEl={anchorEl}
                keepMounted
                open={open}
                onClose={closePostMenu}
              >
                <MenuItem onClick={deletePost}>Delete</MenuItem>
              </Menu>
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="postCenter">
          {post.desc ? <span className="postText">{post.desc}</span> : null}
          {post.img ? <img className="postImg" src={postImg} alt="" /> : null}
        </div>
        <div className="postBottom">
          <div className="postBottomLeft">
            <img
              className="likeIcon"
              src={LikeIcon}
              onClick={likeHandler}
              alt=""
            />

            <span className="postLikeCounter">{like} people liked it</span>
          </div>
          <div className="postBottomRight">
            <span className="postCommentText">{post.comment} comments</span>
          </div>
        </div>
      </div>
    </div>
  );
}
