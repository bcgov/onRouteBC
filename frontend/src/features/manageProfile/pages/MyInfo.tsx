import { memo, useState } from "react";
import { Typography } from "@mui/material";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Navigate } from "react-router-dom";

import "./MyInfo.scss";
import { UserInfoBanner } from "../../../common/components/banners/UserInfoBanner";
import { DisplayMyInfo } from "./DisplayMyInfo";
import { getMyInfo } from "../apiManager/manageProfileAPI";
import { Loading } from "../../../common/pages/Loading";
import { ErrorFallback } from "../../../common/pages/ErrorFallback";
import { MyInfoForm } from "../components/forms/myInfo/MyInfoForm";
import { ERROR_ROUTES } from "../../../routes/constants";

const Header = () => (
  <Typography className="my-info-page__header" variant="h4">
    Edit My Information
  </Typography>
);

export const MyInfo = memo(() => {
  const [isEditing, setIsEditing] = useState(false);
  const {
    data: myInfo,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["myInfo"],
    queryFn: getMyInfo,
    placeholderData: keepPreviousData,
    staleTime: 5000,
  });

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        return <Navigate to={ERROR_ROUTES.UNAUTHORIZED} />;
      }
      return <ErrorFallback error={error.message} />;
    }
  }

  return (
    <div className="my-info-page">
      {isEditing ? <Header /> : null}
      <UserInfoBanner userAuthGroup={myInfo?.userRole} />
      {isEditing ? (
        <MyInfoForm myInfo={myInfo} setIsEditing={setIsEditing} />
      ) : (
        <DisplayMyInfo myInfo={myInfo} setIsEditing={setIsEditing} />
      )}
    </div>
  );
});

MyInfo.displayName = "MyInfo";
