import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  Badge,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  ExitToApp as ExitToAppIcon,
  Login as LoginIcon,
} from "@mui/icons-material";
import "./Header.css";
import Logo from "../images/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/GlobalState";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

export default function Header() {
  const { basket, dispatch } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleAuthentication = () => {
    if (token) {
      // Sign out
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch({ type: "SET_USER", user: null });
      dispatch({ type: "SET_BASKET", basket: [] }); // Clear basket
      navigate("/login");
    } else {
      navigate("/login");
    }
  };

  const handleUploadClick = () => {
    if (!token) {
      alert("Please sign in to upload products");
      navigate("/login");
      return;
    }
    navigate("/upload");
  };

  const handleMobileMenuOpen = () => {
    setMobileMenuOpen(true);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    navigate(`/?search=${encodeURIComponent(query)}`);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" sx={{ background: "#3498db" }}>
        <Toolbar>
          <Link to="/">
            <Box
              component="img"
              sx={{ height: 100 }}
              alt="TradeMate"
              src={Logo}
            />
          </Link>
          <Search>
            <SearchIconWrapper>
              <SearchIcon sx={{ color: "black" }} />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              sx={{ color: "black" }}
              value={searchQuery}
              onChange={handleSearch}
            />
          </Search>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <Button
              sx={{ color: "black" }}
              startIcon={<UploadIcon />}
              onClick={handleUploadClick}
            >
              Upload
            </Button>
            <Link to="/list" style={{ color: "black" }}>
              <IconButton sx={{ color: "black" }}>
                <Badge badgeContent={basket?.length} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </Link>
            <Button sx={{ color: "black" }} onClick={handleAuthentication}>
              {token ? "Sign Out" : "Sign In"}
            </Button>
          </Box>
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton sx={{ color: "black" }} onClick={handleMobileMenuOpen}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        PaperProps={{
          className: "mobile-sidebar",
          sx: { width: 280, borderRadius: "0 0 0 8px" }
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Sidebar Header */}
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <img src={Logo} alt="TradeMate" />
              <Typography variant="h6" sx={{ fontFamily: "'Exo', sans-serif" }}>TradeMate</Typography>
            </div>
            <IconButton 
              className="sidebar-close-btn" 
              onClick={handleMobileMenuClose}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </div>
          
          {/* Menu Items */}
          <List sx={{ py: 2, flex: 1 }}>
            <ListItem 
              button 
              component={Link} 
              to="/"
              onClick={handleMobileMenuClose}
              className="sidebar-menu-item"
              sx={{ mb: 1 }}
            >
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            
            {token && (
              <ListItem
                button
                onClick={() => {
                  handleUploadClick();
                  handleMobileMenuClose();
                }}
                className="sidebar-menu-item"
                sx={{ mb: 1 }}
              >
                <ListItemIcon>
                  <UploadIcon />
                </ListItemIcon>
                <ListItemText primary="Upload Product" />
              </ListItem>
            )}
            
            <ListItem
              button
              component={Link}
              to="/list"
              onClick={handleMobileMenuClose}
              className="sidebar-menu-item"
              sx={{ mb: 1 }}
            >
              <ListItemIcon>
                <Badge badgeContent={basket?.length} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="Your Basket" />
            </ListItem>
            
            <Divider className="sidebar-divider" />
            
            <ListItem
              button
              onClick={() => {
                handleAuthentication();
                handleMobileMenuClose();
              }}
              className="sidebar-menu-item"
            >
              <ListItemIcon>
                {token ? <ExitToAppIcon /> : <LoginIcon />}
              </ListItemIcon>
              <ListItemText primary={token ? "Sign Out" : "Sign In"} />
            </ListItem>
          </List>
          
          {/* Footer */}
          <div className="sidebar-footer">
            <Typography variant="caption">
              © {new Date().getFullYear()} TradeMate. All rights reserved.
            </Typography>
          </div>
        </Box>
      </Drawer>
    </Box>
  );
} 