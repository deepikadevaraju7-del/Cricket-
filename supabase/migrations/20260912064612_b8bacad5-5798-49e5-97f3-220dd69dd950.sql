CREATE POLICY "temp signature upload" ON public.players FOR UPDATE TO anon USING (true) WITH CHECK (true);
GRANT UPDATE ON public.players TO anon;