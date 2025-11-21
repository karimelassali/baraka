-- 03_create_functions.sql

CREATE VIEW customer_points_balance AS
SELECT
  customer_id,
  SUM(points) AS total_points,
  SUM(CASE WHEN transaction_type = 'EARNED' THEN points ELSE 0 END) AS available_points,
  SUM(CASE WHEN transaction_type = 'PENDING' THEN points ELSE 0 END) AS pending_points
FROM
  loyalty_points
GROUP BY
  customer_id;

CREATE VIEW approved_reviews AS
SELECT
  r.id,
  c.first_name || ' ' || c.last_name AS customer_name,
  r.review_text,
  r.rating,
  r.created_at
FROM
  reviews r
JOIN
  customers c ON r.customer_id = c.id
WHERE
  r.is_approved = TRUE
ORDER BY
  r.created_at DESC
LIMIT 20;

CREATE OR REPLACE FUNCTION generate_voucher_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT[] := '{A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,0,1,2,3,4,5,6,7,8,9}';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || chars[1+random()*(array_length(chars, 1)-1)];
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_voucher_and_deduct_points(p_customer_id UUID, p_points_to_redeem INTEGER)
RETURNS JSON AS $$
DECLARE
  new_voucher vouchers;
  new_points loyalty_points;
BEGIN
  -- Create a new voucher
  INSERT INTO vouchers (customer_id, points_redeemed, value, code, expires_at)
  VALUES (p_customer_id, p_points_to_redeem, p_points_to_redeem / 10, generate_voucher_code(), NOW() + INTERVAL '1 year')
  RETURNING * INTO new_voucher;

  -- Deduct points from the customer's account
  INSERT INTO loyalty_points (customer_id, points, transaction_type, reference_id, description)
  VALUES (p_customer_id, -p_points_to_redeem, 'REDEEMED', new_voucher.id::TEXT, 'Redeemed for voucher ' || new_voucher.code)
  RETURNING * INTO new_points;

  RETURN json_build_object('voucher', new_voucher, 'points', new_points);
END;
$$ LANGUAGE plpgsql;
